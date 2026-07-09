<h1>Plan d'Implémentation — Sujet 3 : Assistant Intelligent d'Onboarding</h1>

<p><strong>Projet existant:</strong> assurance-ai-assistant (FastAPI + React, modules RAG, Tasks, Planning déjà existants)<br>
<strong>Durée:</strong> 6 semaines — <strong>Niveau:</strong> 1ʳᵉ année cycle ingénieur
</p>

<hr>

<h2>📌 Objectif du Plan</h2>
<p>Développer le module d'onboarding intelligent en <strong>s'appuyant sur l'architecture existante</strong> (RAG, auth, notifications, planning). Le module s'intègre aux composants déjà en place sans les modifier fondamentalement.</p>

<hr>

<h2>🏗️ Architecture Existante à Exploiter</h2>

<table>
<thead>
<tr><th>Couche</th><th>Existant à réutiliser</th><th>À ajouter pour l'onboarding</th></tr>
</thead>
<tbody>
<tr><td>Base de données</td><td>SQLAlchemy ORM, `database/models.py`, `db.py`</td><td>4 nouvelles tables (voir §4)</td></tr>
<tr><td>Backend API</td><td>FastAPI dans `app/api/`, schéma existant</td><td>4 nouveaux fichiers API</td></tr>
<tr><td>Services métier</td><td>`services/` déjà présent</td><td>4 nouveaux services</td></tr>
<tr><td>RAG / IA</td><td>`llm_service.py`, `rag_service.py`</td><td>Extension dans `ai/onboarding_rag.py`</td></tr>
<tr><td>Notifications</td><td>`notification_service.py` existant</td><td>Réutiliser tel quel</td></tr>
<tr><td>Authentification</td><td>`auth_service.py`, JWT</td><td>Réutiliser tel quel</td></tr>
<tr><td>Frontend</td><td>React + Tailwind + Vite, routing existant</td><td>4 nouveaux composants + 1 dashboard</td></tr>
</tbody>
</table>

<hr>

<h2>📅 Planning Détaillé sur 6 Semaines</h2>

<h3>📆 Semaine 1 — Modèle de données & Base de données</h3>
<p><strong>Objectif:</strong> Concevoir et créer le schéma de base de données + intégration SQLAlchemy.</p>

<table>
<thead>
<tr><th>Jour</th><th>Tâche</th><th>Livrable</th></tr>
</thead>
<tbody>
<tr><td>Lundi</td><td>Étude du schéma existant (models.py) pour comprendre les conventions du projet</td><td>Notes de conventions</td></tr>
<tr><td>Mardi</td><td>Rédaction du schéma SQL des 4 tables onboarding</td><td>`setup_onboarding.sql`</td></tr>
<tr><td>Mercredi</td><td>Création des modèles SQLAlchemy dans `app/models/onboarding.py`</td><td>Modèles SQLAlchemy</td></tr>
<tr><td>Jeudi</td><td>Intégration dans `database/models.py` (ajout des nouveaux modèles)</td><td>Modèles importés</td></tr>
<tr><td>Vendredi</td><td>Création d'un script d'initialisation + test de création des tables</td><td>Tables créées dans SQLite</td></tr>
</tbody>
</table>

<p><em>✅ Critère de validation de la semaine:</em> Les 4 tables sont créées dans `insurance_assistant.db` et des enregistrements de test peuvent y être insérés.</p>

<hr>

<h3>📆 Semaine 2 — Backend: CRUD Onboarding & Étapes</h3>
<p><strong>Objectif:</strong> Développer les services et API REST pour gérer les dossiers d'onboarding et leurs étapes.</p>

<table>
<thead>
<tr><th>Jour</th><th>Tâche</th><th>Livrable</th></tr>
</thead>
<tbody>
<tr><td>Lundi</td><td>Création de `app/services/onboarding_service.py` (CRUD cas)</td><td>Service onboarding</td></tr>
<tr><td>Mardi</td><td>Création de `app/services/step_tracking_service.py` (CRUD étapes + vérification échéances)</td><td>Service étapes</td></tr>
<tr><td>Mercredi</td><td>Création de `app/api/onboarding.py` (routes POST/GET/PUT/DELETE dossiers)</td><td>API onboarding</td></tr>
<tr><td>Jeudi</td><td>Création de `app/api/steps.py` (routes étapes)</td><td>API étapes</td></tr>
<tr><td>Vendredi</td><td>Tests via Swagger (`/docs`) + Postman</td><td>API fonctionnelle testée</td></tr>
</tbody>
</table>

<p><strong>Endpoints à développer:</strong></p>
<pre>POST   /api/onboarding          — Créer un dossier d'onboarding
GET    /api/onboarding          — Lister tous les dossiers
GET    /api/onboarding/{id}     — Détail d'un dossier
PUT    /api/onboarding/{id}     — Modifier un dossier
PUT    /api/onboarding/{id}/status — Changer le statut du dossier

POST   /api/steps               — Ajouter une étape à un dossier
PUT    /api/steps/{id}          — Modifier une étape
PUT    /api/steps/{id}/status   — Changer le statut d'une étape
GET    /api/steps?case_id={id}  — Lister les étapes d'un dossier</pre>

<p><em>✅ Critère de validation:</em> Via Swagger, on peut créer un dossier, ajouter des étapes, modifier leurs statuts, et récupérer le tout.</p>

<hr>

<h3>📆 Semaine 3 — Backend: Interactions, Notifications & Dashboard API</h3>
<p><strong>Objectif:</strong> Développer les services d'interactions, les notifications, et l'API du dashboard.</p>

<table>
<thead>
<tr><th>Jour</th><th>Tâche</th><th>Livrable</th></tr>
</thead>
<tbody>
<tr><td>Lundi</td><td>Création de `app/services/interaction_service.py`</td><td>Service interactions</td></tr>
<tr><td>Mardi</td><td>Création de `app/api/interactions.py`</td><td>API interactions</td></tr>
<tr><td>Mercredi</td><td>Extension de `notification_service.py` pour les alertes onboarding (ou création d'un adapter)</td><td>Notifications onboarding</td></tr>
<tr><td>Jeudi</td><td>Extension de `app/api/notifications.py` pour exposer les nouvelles notifications onboarding</td><td>API notifications onboarding</td></tr>
<tr><td>Vendredi</td><td>Création de `app/api/dashboard.py` ( Agrégation des KPIs onboarding)</td><td>API dashboard onboarding</td></tr>
</tbody>
</table>

<p><strong>Nouveaux endpoints:</strong></p>
<pre>POST   /api/interactions           — Ajouter une interaction
GET    /api/interactions?case_id=   — Historique des interactions
PUT    /api/interactions/{id}       — Modifier une interaction
DELETE /api/interactions/{id}       — Supprimer une interaction

GET    /api/notifications/onboarding — Notifications liées à l'onboarding

GET    /api/dashboard/onboarding     — JSON avec tous les KPIs du dashboard onboarding</pre>

<p><em>✅ Critère de validation:</em> On peut enregistrer des interactions, recevoir des notifications pour les étapes en retard, et le dashboard retourne les bonnes statistiques.</p>

<hr>

<h3>📆 Semaine 4 — Backend: Moteur IA & Intégration RAG</h3>
<p><strong>Objectif:</strong> Développer le moteur de scoring de risque d'abandon et intégrer l'assistant RAG aux données d'onboarding.</p>

<table>
<thead>
<tr><th>Jour</th><th>Tâche</th><th>Livrable</th></tr>
</thead>
<tbody>
<tr><td>Lundi</td><td>Création de `app/services/dropoff_prediction_service.py`</td><td>Service scoring IA</td></tr>
<tr><td>Mardi</td><td>Création de `app/api/risk_scores.py` (calcul + consultation des scores)</td><td>API risk_scores</td></tr>
<tr><td>Mercredi</td><td>Extension de `app/ai/onboarding_rag.py` (si n'existe pas, le créer dans `app/ai/`)</td><td>Intégration RAG onboarding</td></tr>
<tr><td>Jeudi</td><td>Modification de `llm_service.py` pour inclure le contexte onboarding dans les réponses</td><td>LLM conscient de l'onboarding</td></tr>
<tr><td>Vendredi</td><td>Création d'un endpoint `/api/ai/onboarding-chat` pour les questions en langage naturel sur l'onboarding</td><td>Assistant IA onboarding fonctionnel</td></tr>
</tbody>
</table>

<p><strong>Variables du modèle de scoring:</strong></p>
<pre>temps_etape_actuelle / moyenne
relances_sans_reponse
documents_manquants
nb_interactions_client
jours_depuis_derniere_interaction
type_produit
delai_restant_avant_echeance</pre>

<p><strong>Nouveaux endpoints IA:</strong></p>
<pre>POST   /api/risk-scores/calculate  — Recalculer les scores pour un dossier
GET    /api/risk-scores             — Lister tous les scores
GET    /api/risk-scores?case_id=    — Score d'un dossier spécifique

POST   /api/ai/onboarding-chat      — Question en langage naturel sur les onboardings
  body: { "message": "Quels clients risquent d'abandonner ?" }</pre>

<p><em>✅ Critère de validation:</em> Le score de risque se calcule automatiquement, et le chatbot peut répondre à des questions comme "Quel dossier dois-je relancer en priorité ?".</p>

<hr>

<h3>📆 Semaine 5 — Frontend: Interface Onboarding & Dashboard</h3>
<p><strong>Objectif:</strong> Construire l'interface utilisateur React complète pour le module onboarding.</p>

<table>
<thead>
<tr><th>Jour</th><th>Tâche</th><th>Livrable</th></tr>
</thead>
<tbody>
<tr><td>Lundi</td><td>Exploration de la structure frontend existante (src/) — composants, routing, hooks API</td><td>Notes architecture frontend</td></tr>
<tr><td>Mardi</td><td>Création des composants Onboarding: `OnboardingList.jsx`, `OnboardingForm.jsx`, `OnboardingDetail.jsx`</td><td>Vues CRUD onboarding</td></tr>
<tr><td>Mercredi</td><td>Création des composants Étapes: `StepList.jsx`, `StepForm.jsx` (intégrés dans OnboardingDetail)</td><td>Gestion des étapes</td></tr>
<tr><td>Jeudi</td><td>Création des composants Interactions: `InteractionList.jsx`, `InteractionForm.jsx`</td><td>Gestion des interactions</td></tr>
<tr><td>Vendredi</td><td>Création du Dashboard: `OnboardingDashboard.jsx` (widgets + graphiques Chart.js)</td><td>Dashboard visuel</td></tr>
</tbody>
</table>

<p><strong>Composants à créer dans `frontend/src/`:</strong></p>
<pre>src/
  pages/
    OnboardingList.jsx          ← Liste des dossiers + filtres
    OnboardingForm.jsx          ← Formulaire création/édition dossier
    OnboardingDetail.jsx        ← Détail d'un dossier + ses étapes + interactions
    OnboardingDashboard.jsx     ← Tableau de bord onboarding
  components/
    StepCard.jsx                ← Carte d'une étape avec statut visuel
    StepForm.jsx                ← Formulaire d'ajout/modif d'étape
    InteractionTimeline.jsx     ← Timeline des interactions client
    InteractionForm.jsx         ← Formulaire d'ajout d'interaction
    RiskBadge.jsx               ← Badge de niveau de risque (couleur)
    DropoffChart.jsx            ← Graphique du taux de risque par dossier</pre>

<p><em>✅ Critère de validation:</em> L'utilisateur peut créer un dossier d'onboarding, ajouter des étapes, des interactions, et visualiser le dashboard avec tous les KPIs.</p>

<hr>

<h3>📆 Semaine 6 — Tests, Documentation & Bonus IA</h3>
<p><strong>Objectif:</strong> Finaliser le moteur de recommandation, tester l'ensemble, documenter, et préparer la démo.</p>

<table>
<thead>
<tr><th>Jour</th><th>Tâche</th><th>Livrable</th></tr>
</thead>
<tbody>
<tr><td>Lundi</td><td>Finalisation du moteur de recommandation IA (priorisation automatique des relances)</td><td>Moteur de recommandation</td></tr>
<tr><td>Mardi</td><td>Intégration frontend du moteur IA: bouton "Optimiser mon planning" + liste priorisée</td><td>Interface recommandation</td></tr>
<tr><td>Mercredi</td><td>Tests E2E: créer un dossier → ajouter étapes → simuler un blocage → vérifier le score IA → vérifier la notification</td><td>Tests E2E documentés</td></tr>
<tr><td>Jeudi</td><td>Écriture de la documentation technique (README backend + frontend) + rapport de stage</td><td>Documentation + rapport</td></tr>
<tr><td>Vendredi</td><td>Préparation de la démo + vidéo de présentation + nettoyage du code</td><td>Démo fonctionnelle + vidéo</td></tr>
</tbody>
</table>

<p><strong>Tests à réaliser:</strong></p>
<ul>
<li>✅ API: Créer dossier → ajouter étapes → changer statuts → ajouter interactions</li>
<li>✅ Dashboard: KPI "dossiers bloqués" s'actualise quand une étape dépasse l'échéance</li>
<li>✅ IA: Le chatbot répond correctement aux questions sur les onboardings</li>
<li>✅ IA: Le score de risque change quand on ajoute un document manquant ou une relance</li>
<li>✅ Notifications: Une notification apparaît quand une étape dépasse l'échéance</li>
</ul>

<hr>

<h2>🗃️ Schéma de Base de Données — Résumé</h2>

<table>
<thead>
<tr><th>Table</th><th>Colonnes principales</th><th>Relations</th></tr>
</thead>
<tbody>
<tr><td><code>onboarding_cases</code></td><td>id, client_name, client_email, client_phone, product_type, current_step, status, start_date, expected_completion_date, assigned_agent</td><td>1:N → onboarding_steps, client_interactions, dropoff_risk_scores</td></tr>
<tr><td><code>onboarding_steps</code></td><td>id, case_id, step_name, status, deadline, completed_at, required_documents, notes</td><td>N:1 → onboarding_cases</td></tr>
<tr><td><code>client_interactions</code></td><td>id, case_id, interaction_type, notes, interaction_date, next_followup_date, created_by</td><td>N:1 → onboarding_cases</td></tr>
<tr><td><code>dropoff_risk_scores</code></td><td>id, case_id, risk_score, risk_level, risk_factors, suggested_action, calculated_at</td><td>N:1 → onboarding_cases</td></tr>
</tbody>
</table>

<hr>

<h2>📦 Fichiers à Créer / Modifier — Vue d'Ensemble</h2>

<h3>Backend — Nouveaux fichiers</h3>
<pre>backend/
  app/
    models/
      onboarding.py            ← Nouveaux modèles SQLAlchemy
    services/
      onboarding_service.py    ← CRUD dossiers onboarding
      step_tracking_service.py ← Gestion étapes + alertes échéances
      interaction_service.py   ← Gestion interactions client
      dropoff_prediction_service.py ← Moteur scoring IA
    api/
      onboarding.py            ← Routes dossiers
      steps.py                 ← Routes étapes
      interactions.py          ← Routes interactions
      risk_scores.py           ← Routes scores + calcul
      dashboard.py             ← KPIs agrégés (ou extension d'un existant)
    ai/
      onboarding_rag.py        ← Extension RAG pour onboarding</pre>

<h3>Backend — Fichiers à modifier</h3>
<pre>backend/
  app/
    database/
      models.py                ← Ajout import onboarding models
    main.py                    ← Inclusion des nouveaux routers
  requirements.txt              ← Ajout scikit-learn si besoin</pre>

<h3>Frontend — Nouveaux composants</h3>
<pre>frontend/
  src/
    pages/
      OnboardingList.jsx
      OnboardingForm.jsx
      OnboardingDetail.jsx
      OnboardingDashboard.jsx
    components/
      StepCard.jsx
      StepForm.jsx
      InteractionTimeline.jsx
      InteractionForm.jsx
      RiskBadge.jsx
      DropoffChart.jsx
      OnboardingChat.jsx       ← Chat IA intégré à l'onboarding</pre>

<hr>

<h2>🔗 Intégration avec les Modules Existants</h2>

<table>
<thead>
<tr><th>Module existant</th><th>Point d'intégration</th></tr>
</thead>
<tbody>
<tr><td>RAG (rag_service.py)</td><td>Indexer les documents d'onboarding (formulaires signés, échanges client) pour que le chatbot puisse y répondre</td></tr>
<tr><td>Notifications (notification_service.py)</td><td>Réutiliser pour les alertes onboarding (étapes en retard, clients inactifs)</td></tr>
<tr><td>Planning (planning_service.py)</td><td>Réutiliser pour la planification des relances client</td></tr>
<tr><td>Tasks (task_service.py)</td><td>Réutiliser: chaque étape d'onboarding peut être vue comme une tâche</td></tr>
<tr><td>Calendar (calendar_service.py)</td><td>Réutiliser: afficher les rendez-vous de relance dans le calendrier</td></tr>
<tr><td>Chat (chat.py)</td><td>Étendre le chat existant avec le contexte onboarding</td></tr>
<tr><td>Auth (auth_service.py)</td><td>Réutiliser pour l'authentification des agents</td></tr>
</tbody>
</table>

<hr>

<h2>🧠 Bonus IA — Moteur de Recommandation (Détail Technique)</h2>

<p><strong>Algorithme proposé:</strong></p>
<ol>
<li><strong>Collecte des features</strong> pour chaque dossier d'onboarding actif.</li>
<li><strong>Normalisation</strong> des valeurs (score entre 0 et 1).</li>
<li><strong>Calcul du score composite:</strong><pre>score = (w1 × temps_etape_normalisé)
      + (w2 × relances_sans_reponse_normalisé)
      + (w3 × documents_manquants_normalisé)
      + (w4 × jours_inactivité_normalisé)
      + (w5 × (1 - delai_restant_normalisé))

Poids suggérés: w1=0.20, w2=0.25, w3=0.20, w4=0.25, w5=0.10</pre></li>
<li><strong>Attribution du niveau</strong>: faible (&lt;0.3), moyen (0.3-0.6), élevé (0.6-0.8), critique (&gt;0.8).</li>
<li><strong>Classement automatique</strong> par score décroissant.</li>
<li><strong>Génération de l'action suggérée</strong> selon le facteur dominant.</li>
</ol>

<p><strong>Intégration dans le frontend:</strong></p>
<ul>
<li>Bouton <em>"Optimiser mes relances"</em> dans le dashboard</li>
<li>Liste triée des clients à contacter en priorité</li>
<li>Badge coloré par niveau de risque sur chaque dossier</li>
</ul>

<hr>

<h2>⚠️ Points d'Attention & Risques</h2>

<table>
<thead>
<tr><th>Risque</th><th>Impact</th><th>Mitigation</th></tr>
</thead>
<tbody>
<tr><td>Temps de calcul du score IA élevé si beaucoup de dossiers</td><td>Moyen</td><td>Calcul asynchrone (Celery ou background task), cache Redis</td></tr>
<tr><td>Le schéma SQL diffère trop de l'existant</td><td>Moyen</td><td>Respecter strictement les conventions SQLAlchemy déjà utilisées</td></tr>
<tr><td>Frontend React: manque d'expérience avec l'architecture existante</td><td>Élevé</td><td>Lundi S5 dédié à l'étude du code frontend existant</td></tr>
<tr><td>Intégration RAG: contexte mal transmis au LLM</td><td>Moyen</td><td>Tester avec des jeux de données variés, affiner le prompt</td></tr>
<tr><td>Dépendance à Ollama (LLM local) pour les tests</td><td>Faible</td><td>Prévoir un fallback ou des mock responses pour les tests</td></tr>
</tbody>
</table>

<hr>

<h2>📝 Résumé du Planning</h2>

<table>
<thead>
<tr><th>Semaine</th><th>Focus</th><th>Livrable principal</th></tr>
</thead>
<tbody>
<tr><td>S1</td><td>Base de données</td><td>Schema SQL + Modèles SQLAlchemy onboarding</td></tr>
<tr><td>S2</td><td>Backend CRUD</td><td>API REST onboarding + étapes fonctionnelles</td></tr>
<tr><td>S3</td><td>Interactions & Notifications</td><td>Interactions, notifications onboarding, API dashboard</td></tr>
<tr><td>S4</td><td>IA & RAG</td><td>Moteur de scoring + Chatbot onboarding</td></tr>
<tr><td>S5</td><td>Frontend</td><td>Interface complète + Dashboard visuel</td></tr>
<tr><td>S6</td><td>Tests & Finalisation</td><td>Tests + Documentation + Démo</td></tr>
</tbody>
</table>

<hr>

<h2>✅ Acceptation du Planning</h2>
<p><strong>Si tu acceptes ce planning, je commence immédiatement par la Semaine 1 :</strong></p>
<ol>
<li>Étude du schéma existant</li>
<li>Création de `setup_onboarding.sql`</li>
<li>Création de `app/models/onboarding.py`</li>
<li>Intégration dans `database/models.py`</li>
<li>Script d'initialisation + test</li>
</ol>

<p>Dis-moi si tu acceptes ce planning ou si tu veux modifier certains points (durée, ordre des semaines, technologies, périmètre).</p>
