# Vision globale du projet (état actuel ~100%)

## 1) Résumé produit

On construit une plateforme **multi-tenant** de chatbots contextuels :

- Plusieurs propriétaires (admins) peuvent gérer leurs propres chatbots.
- Chaque chatbot est lié à un **domain** unique.
- Le widget frontend envoie la question avec le **domain** courant.
- Le backend résout ce domain vers le chatbot, récupère les données pertinentes, puis génère la réponse via **Gemini**.
- Le chatbot est **informatif uniquement** (pas d’action métier externe comme envoyer des emails, modifier des fichiers, etc.).

Objectif global : architecture réutilisable pour plusieurs secteurs (université, entreprise, commerce, etc.), sans couplage à un cas unique.

---

## 2) Stack technique (backend)

- **Node.js + Express + TypeScript**
- **Sequelize** (MySQL)
- **JWT** (middlewares `requireAuth`, `requireRole`)
- **Jest + Supertest** pour les tests API/unitaires
- Validation côté middleware/service
- Enveloppe de réponse API standard :
  - succès : `{ success: true, data, error: null }`
  - erreur : `{ success: false, data: null, error: { code, message, details? } }`

Le backend expose une route santé `GET /health`, les routes versionnées sous `/api/v1`, et une route publique runtime : `POST /api/v1/public/chat`.

---

## 3) Architecture backend (organisation logique)

Structure importante :

- `src/index.ts` : bootstrap app, middlewares globaux, montage des routes, `errorHandler`.
- `src/api/v1/routes` : contrat HTTP (auth, chatbots, blocks, tags, runtime public).
- `src/api/v1/controllers` : couches minces (bridge req/res vers services).
- `src/api/v1/services` : logique métier (ownership, validation métier, orchestration runtime).
- `src/api/v1/models` : mapping Sequelize ↔ tables MySQL.
- `src/api/v1/validations` : validation des payloads HTTP.
- `src/api/v1/middlewares` : auth, rôle, rate limiter public chat, gestion centralisée des erreurs.

Principe appliqué : **tenancy et sécurité dans les services + middlewares**, contrôleurs volontairement fins.

---

## 4) Modèle de données (vue fidèle à l’implémentation)

## 4.1 Identité / rôles

- `roles`
  - `role_id` (PK)
  - `role_name` (unique, uppercase)
  - `description`, `created_at`

- `users`
  - `user_id` (PK)
  - `role_id` (FK → `roles`)
  - `email` (unique)
  - `password_hash`
  - `created_at`

## 4.2 Chatbots (multi-tenant)

- `chatbots`
  - `chatbot_id` (PK)
  - `user_id` (owner FK → `users`)
  - `domain` (unique)
  - `display_name`
  - `created_at`
  - `created_by`

La séparation par tenant est assurée via `user_id` + vérifications d’ownership dans les services.

## 4.3 Entités de connaissances (hybride statique/dynamique)

- `bb_entities`
  - `entity_id` (PK)
  - `entity_type` (nullable, ex: `CONTACT`, `SCHEDULE`)
  - `type_id` (nullable, pour dynamique)
  - `data` (JSON nullable, pour dynamique)
  - `created_at`

Contrat métier implémenté :

- **Statique** : `entity_type` renseigné, `type_id = null`, `data = null`
- **Dynamique** : `entity_type = null`, `type_id` renseigné, `data` JSON

## 4.4 Blocks statiques

- `bb_contacts` (1 ligne par entity CONTACT)
  - `entity_id` (PK/FK)
  - `org_name`, `phone`, `email`, `address_text`, `city`, `country`, `hours_text`

- `bb_schedules` (1 ligne par entity SCHEDULE dans le design actuel)
  - `entity_id` (PK/FK)
  - `title`, `day_of_week`, `open_time`, `close_time`, `notes`

> Note: l’API expose une liste de schedules (plusieurs entités SCHEDULE par chatbot), chacune avec son `entity_id`.

## 4.5 Types dynamiques et instances

- `bb_block_type_definitions`
  - `type_id` (PK)
  - `chatbot_id` (nullable)
    - `NULL` + `is_system=true` = type global système
    - non NULL = type custom d’un chatbot
  - `type_name`
  - `schema_definition` (JSON)
  - `description`
  - `is_system`
  - `created_at`

- Les **instances** dynamiques sont stockées dans `bb_entities` (`type_id` + `data`), puis liées au chatbot via `chatbot_items`.

## 4.6 Indexation chatbot ↔ entités

- `chatbot_items`
  - `item_id` (PK)
  - `chatbot_id` (FK)
  - `entity_id` (FK)
  - `created_at`

Cette table est le pivot clé pour dire « cet item de connaissance appartient à ce chatbot ».

## 4.7 Tagging

- `tags`
  - `tag_id` (PK)
  - `tag_code` (unique, uppercase)
  - `description`, `category`
  - `is_system`
  - `synonyms_json` (JSON)

- `chatbot_item_tags`
  - PK composite (`item_id`, `tag_id`)

Les tags servent à l’indexation sémantique et au filtrage runtime.

---

## 5) API backend (état implémenté)

## 5.1 Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

`register` supporte `ADMIN` et `USER` (pas ADMIN-only).

## 5.2 Admin (gestion propriétaire)

### Chatbots
- `POST /api/v1/chatbots`
- `GET /api/v1/chatbots`
- `GET /api/v1/chatbots/:id`
- `PATCH /api/v1/chatbots/:id`
- `DELETE /api/v1/chatbots/:id`

### Blocks statiques
- Contact:
  - `POST /api/v1/chatbots/:chatbotId/blocks/contact`
  - `GET /api/v1/chatbots/:chatbotId/blocks/contact`
  - `PUT /api/v1/chatbots/:chatbotId/blocks/contact`
- Schedules:
  - `POST /api/v1/chatbots/:chatbotId/blocks/schedules`
  - `GET /api/v1/chatbots/:chatbotId/blocks/schedules`
  - `PUT /api/v1/chatbots/:chatbotId/blocks/schedules/:entityId`
  - `DELETE /api/v1/chatbots/:chatbotId/blocks/schedules/:entityId`

### Types dynamiques
- `POST /api/v1/chatbots/:chatbotId/block-types`
- `GET /api/v1/chatbots/:chatbotId/block-types`
- `GET /api/v1/chatbots/:chatbotId/block-types/:typeId`
- `PUT /api/v1/chatbots/:chatbotId/block-types/:typeId`
- `DELETE /api/v1/chatbots/:chatbotId/block-types/:typeId`

### Instances dynamiques
- `POST /api/v1/chatbots/:chatbotId/blocks/dynamic/:typeId`
- `GET /api/v1/chatbots/:chatbotId/blocks/dynamic/:typeId`
- `GET /api/v1/chatbots/:chatbotId/blocks/dynamic/:typeId/:entityId`
- `PUT /api/v1/chatbots/:chatbotId/blocks/dynamic/:typeId/:entityId`
- `DELETE /api/v1/chatbots/:chatbotId/blocks/dynamic/:typeId/:entityId`

### Tags
- Taxonomie:
  - `GET /api/v1/tags`
  - `POST /api/v1/tags`
  - `PUT /api/v1/tags/:tagId`
  - `DELETE /api/v1/tags/:tagId`
- Tags par item:
  - `GET /api/v1/chatbots/:chatbotId/items`
  - `GET /api/v1/chatbots/:chatbotId/items/:itemId/tags`
  - `PUT /api/v1/chatbots/:chatbotId/items/:itemId/tags`

## 5.3 User browse (read-only)

- `GET /api/v1/users/chatbots`
- `GET /api/v1/users/chatbots/:id`

Accès `ADMIN` et `USER`. Permet de consulter les données d’un chatbot en lecture (contact, schedules, custom blocks + instances).

## 5.4 Runtime public chat (feature désormais complète)

- `POST /api/v1/public/chat`
  - endpoint **public** (sans JWT)
  - protégé par rate limit (`20 req/min/IP`)
  - payload validé (message, chatbotId/domain, history)

---

## 6) Pipeline runtime réel (implémenté)

Entrée côté widget/user :

```json
{
  "domain": "shop.example.com",
  "message": "What are your opening hours?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

Flow backend :

1. **Validation HTTP** (`chatRuntimeValidation`) : taille message, shape history, chatbotId/domain requis.
2. **Résolution tenant** (`ChatRuntimeService.resolveChatbot`) :
   - par `chatbotId` ou par `domain`.
3. **Classification tags** (`TagService.classifyQuestion`) :
   - v1 actuelle = matching déterministe via `synonyms_json` + fallback `tag_code`.
4. **Recherche de connaissances** (`fetchKnowledgeItems`) :
   - jointures `chatbot_item_tags` + `tags` + `chatbot_items`
   - puis lecture batch `bb_entities` + (`bb_contacts`, `bb_schedules`, `bb_block_type_definitions`) selon type.
5. **Sélection contexte** (`selectContextItems`) :
   - priorité stricte: `CONTACT` > `SCHEDULE` > `DYNAMIC`
   - tri: priorité, `created_at` desc, `entity_id` asc
   - limite `MAX_CONTEXT_ITEMS = 5`
6. **Construction contexte texte** (`buildContextText`).
7. **Appel LLM** (`LLMService.askGemini`) :
   - Gemini via `@google/generative-ai`
   - modèle configuré (`gemini-2.5-flash`)
   - history tronquée (`MAX_CHAT_HISTORY_MESSAGES = 5`)
8. **Réponse API** :
   - `answer`
   - `sourceItems` (entity + type + tags)

Gestion d’erreurs runtime notable :

- `CHATBOT_NOT_FOUND` (404)
- `NO_RELEVANT_TAG` (400)
- `VALIDATION_ERROR` (400)
- `RATE_LIMIT_EXCEEDED` (429)
- `LLM_UNAVAILABLE` (503, mapping des erreurs Gemini)

---

## 7) Auto-tagging & conventions métier

- Auto-tagging statique :
  - `CONTACT` → `['CONTACT', 'PHONE', 'ADDRESS', 'HOURS']`
  - `SCHEDULE` → `['SCHEDULE', 'HOURS']`

- Auto-tagging dynamique (mapping actuel) :
  - `PERSONAL_INFORMATION` → `['PERSONAL_INFO']`

- L’admin peut ensuite lire/remplacer les tags d’un item via routes item-tags.

---

## 8) Frontend (seulement le nécessaire côté widget)

Sans détailler tout le frontend :

- Le `ChatWidget` envoie les messages vers `userApi.chatByDomain(...)`.
- `userApi.chatByDomain` appelle `POST /public/chat`.
- Le `domain` est injecté depuis la page shop/chatbot (`ShopDetail`) pour garantir le scope tenant correct.
- L’historique conversationnel est converti dans le format attendu (`{ role, content }`) puis transmis au backend.

Résultat : le widget répond contextuellement selon le chatbot associé au domain courant.

---

## 9) État d’avancement par features (version actuelle)

- ✅ Feature 1: setup + healthcheck
- ✅ Feature 2: auth + roles + JWT
- ✅ Feature 3: CRUD chatbots owner-scoped
- ✅ Feature 4: static blocks (contact/schedules) + tagging
- ✅ Feature 5: dynamic block types (global system + chatbot custom)
- ✅ Feature X: dynamic block instances complètes (CRUD + validation schema)
- ✅ Feature user browse: lecture structurée des chatbots pour rôle USER/ADMIN
- ✅ Feature 8 chat runtime: endpoint public + pipeline complet + intégration Gemini

Le backend couvre maintenant la boucle complète :
**gestion des connaissances (admin) → indexation tags → runtime public domain-based → génération LLM**.
