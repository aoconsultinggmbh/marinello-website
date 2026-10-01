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

Stand 01.10.2026:

1. ~~Kontaktformular~~ erledigt: schickt per `anfrage-senden.php` an
   praxis@kfo-marinello.de, Rückfallweg Mailprogramm. Testanfrage auf dem
   echten Server steht noch aus.
2. ~~Foto Dr. Krokos~~ erledigt.
3. **Impressum: Berufshaftpflicht-Versicherung fehlt** (Name, Sitz, Geltungsraum).
   Bei der Praxis erfragen. Steht gelb markiert auf der Seite.
4. Datenschutzbeauftragter: laut Admir keiner benannt, Hinweis entfernt.
   Von der Praxis bestätigen lassen.
5. Vertrag zur Auftragsverarbeitung mit All-Inkl im KAS abschließen – der
   Datenschutztext sagt bereits, dass er besteht.
6. Besucherzählung (Matomo): noch nicht entschieden, nicht eingebunden.
7. ~~Weiterleitungen~~ erledigt: 48 alte Adressen in der `.htaccess`.
8. Die www-Umleitung in der `.htaccess` ist auskommentiert und wird erst am
   Livegang-Tag freigeschaltet, nachdem das Zertifikat da ist.

## Was schon passt

Keine externen Schriften, keine fremden Skripte. Google Maps wird erst nach
Zustimmung geladen, das Einwilligungsfenster und ein Barrierefreiheits-Bedienfeld
sind eingebaut. Impressum, Datenschutz und Gleichstellungshinweis sind vorhanden.
