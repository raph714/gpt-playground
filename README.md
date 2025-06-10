# gpt-playground

This repository contains a basic static website structure.

## Contents

- `index.html` - The main HTML page.
- `css/style.css` - Styles for the website and card layout.
- `js/app.js` - Game logic with a simple computer opponent, win conditions,
  increasing difficulty each round, and card descriptions.
- `images/` - Placeholder directory for site images.

## Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) publishes the site to
GitHub Pages whenever changes are pushed to the `main` branch. After enabling
GitHub Pages in the repository settings, you can access the latest version of
the site from the URL reported in the workflow logs.

## Updates

- Card descriptions appear in the market and directly on cards in your hand.
- Refreshed visuals with cleaner card layout, styled buttons, and highlighted
  game info boxes.
- Added simple emoji card art, a new Jester and Village card, and tweaked
  costs to reduce early gold rushes.
- Introduced a Militia attack card and mid-tier Duchy victory card.
- Adjusted costs for several cards to better balance play.
- The AI now gains Militia cards in later rounds, creating direct competition
  by reducing your available coins when it draws them.
- Expanded the card set to over 150 medieval-themed cards with a mix of
  offense, defense and resource abilities.
- Added a defense stat that offsets attack damage and updated the market to
  include every card type each round.
- The market now refreshes all cards at the end of each turn.

## Card Data

All card definitions live in `js/cards.json`. Each entry lists the card's cost,
description and any bonus effects like extra coins or draws. Modify this file to
create new cards or adjust existing ones.

## New Card Effects

Five additional mechanics appear on late-game cards:

- **Discount** – cards in your hand reduce purchase costs by 1 coin each.
- **Coin on Buy** – grants bonus coins immediately when you purchase the card.
- **Draw on Buy** – draw extra cards right after buying the card.
- **Attack on Buy** – cuts the opponent's coins when the card is purchased.
- **VP on Buy** – awards victory points the moment you acquire the card.

### Multipliers and Dividers

Some late-game cards modify other effects by multiplication or division:

- **Coin Multiplier** – multiplies the total coins provided by your hand.
- **Coin Divider** – divides the coins from your hand (rounded down).
- **Draw Multiplier** – multiplies any extra card draw you would gain.
- **Draw Divider** – divides bonus draw amounts (rounded down).
- **Attack Multiplier** – multiplies attack values when dealing damage.
- **Attack Divider** – reduces attack values by dividing them.
- **Defense Multiplier** – multiplies defense when blocking attacks.
- **Defense Divider** – divides defense amounts before they absorb damage.

## Game Rules

- Each player starts with a deck of seven **Copper** cards and three **Estate** cards.
- Draw five cards at the start of your turn plus any bonus cards granted by your hand.
- Select coin cards in your hand and click **Buy** under a market card to purchase it.
- Attack cards reduce your opponent's coins while defense cards block incoming attack.
- After you end your turn, the AI takes its own turn.
- The first player to reach **15 victory points** wins the round.

## Working with Codex

Codex provides a terminal for editing files and running commands. After making
changes you can verify the game code with:

```bash
node --check js/app.js
```

Open `index.html` in a browser to play locally and confirm your changes.

## Contributing and Pull Requests

1. Create a new branch from `main` and commit your changes with clear messages.
2. Push the branch to your fork or repository.
3. Open a pull request on GitHub describing the changes and their purpose.

When your PR is merged, GitHub Actions will deploy the updated site.
