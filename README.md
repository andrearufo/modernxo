# Tris∞ — modernxo

Il tris che non finisce mai in pareggio. Web app mobile (installabile come PWA) in Vue 3 + Vite.

## Regole

- Metti tre segni in fila per vincere.
- Ogni giocatore ha al massimo **3 segni** sulla griglia.
- Quando ne piazzi un quarto, il tuo segno più vecchio sparisce (lampeggia quando sta per farlo).
- Non esiste il pareggio; a ogni round inizia l'altro giocatore.

Modalità: contro la CPU (Facile / Medio / Difficile) oppure in due sullo stesso telefono.

## Struttura

| File | Ruolo |
|---|---|
| `src/game.js` | Motore puro e immutabile: stato, mosse, vittoria, IA (negamax + alpha-beta) |
| `src/game.test.js` | Test del motore (`yarn test`, nessuna dipendenza) |
| `src/App.vue` | Menu, partita, punteggio, pannello risultato |
| `src/style.css` | Tema, layout mobile, animazioni |
| `public/sw.js` | Service worker: gioco offline dopo la prima visita (solo in build di produzione) |

Nota: con gioco perfetto **chi inizia vince sempre** (verificato con analisi retrograda su tutti i ~147k stati).
Il livello Difficile cerca 11 semimosse in avanti ed è di fatto perfetto; per questo chi inizia si alterna a ogni round.

## Comandi

```sh
yarn          # installa
yarn dev      # sviluppo (esposto in LAN, apri dal telefono)
yarn test     # test del motore
yarn build    # build di produzione in dist/
```
