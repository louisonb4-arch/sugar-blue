# Sugar Blue Café — site

Coffee shop & brunch · 4 rue de l'Arche Sèche, Nantes · depuis 2014.

Site statique (HTML/CSS/JS, sans étape de build côté Vercel) :
- `src/index.html` — source de la page (le logo vectorisé est injecté par `build.py`)
- `index.html` — page générée : **ne pas éditer à la main**, relancer `python3 build.py`
- `css/style.css` — design system (bleu façade `#12505c`, sauge `#5f8c77`, crème `#f5eee2`) ; polices Lobster, Kumar One Outline, Josefin Sans, Jost
- `js/main.js` — intro « la façade » (portes + pancarte), statut ouvert/fermé en direct (Europe/Paris), révélations GSAP, onglets de la carte, pile de polaroids, logo du pied de page
- `js/vendor/` — GSAP, ScrollTrigger, SplitText, Lenis
- `img/` — photos (© Sugar Blue Café)

Horaires : section `#hours` de `src/index.html`, logique du statut dans `js/main.js`, données structurées (JSON-LD) dans le `<head>`.

Déploiement : Vercel, chaque push sur `main` redéploie.
