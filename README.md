# Kieferorthopädie Dr. med. dent. Ivana Marinello, Butzbach

Webseite der kieferorthopädischen Praxis Dr. Marinello, Wetzlarer Straße 28,
35510 Butzbach. Entwurf von Ovi, aufgesetzt aus `kunde-website-vorlage`.

- **Vorschau:** https://marinello.vorschau.ao-consult.de
- **Ziel-Domain:** kfo-marinello.de (liegt bei united-domains, Mail ebenfalls dort)
- **Karriereseite:** karriere-kfo-marinello.de (liegt bei Raidboxes, eigenes Projekt)

## Die zwei Zweige

- **`main`** = Vorschau. Suchmaschinen ausgesperrt. Hier passiert die Arbeit.
- **`live`** = die echte Seite. Erst wenn `live` auf den Stand von `main` gesetzt
  wird, geht etwas zum Hoster.

## Vor dem Livegang zu erledigen

Die vollständige Liste steht in `doku/checkliste-livegang.md`. Offen sind
zusätzlich diese projekteigenen Punkte:

1. **Das Kontaktformular verschickt nichts.** `assets/skript.js` blendet nur das
   Formular aus und zeigt einen Dank. Jede Anfrage geht damit verloren.
   `anfrage-senden.php` liegt vorbereitet im Projekt und muss angeschlossen werden,
   Empfängeradresse mit der Praxis abstimmen.
2. **Foto fehlt:** auf `ueber-uns.html` steht sichtbar ein Platzhalter
   „Foto fehlt: dr-wiebke-krokos". Bild anfordern oder den Abschnitt entfernen.
3. **Besucherzählung:** Seite in Matomo anlegen, Nummer in
   `assets/js/statistik.js` eintragen und das Skript auf allen Seiten einbinden.
4. **Weiterleitungen:** die bestehende Seite unter kfo-marinello.de auslesen und
   die alten Adressen in die `.htaccess` eintragen.
5. Die www-Umleitung in der `.htaccess` ist auskommentiert und wird erst am
   Livegang-Tag freigeschaltet.

## Was schon passt

Keine externen Schriften, keine fremden Skripte. Google Maps wird erst nach
Zustimmung geladen, das Einwilligungsfenster und ein Barrierefreiheits-Bedienfeld
sind eingebaut. Impressum, Datenschutz und Gleichstellungshinweis sind vorhanden.
