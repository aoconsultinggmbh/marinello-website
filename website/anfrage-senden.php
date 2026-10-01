<?php
/* ============================================================================
   Kontaktformular der Kieferorthopaedie Dr. Marinello.
   Nimmt die Anfrage vom Formular entgegen und schickt sie als E-Mail weiter.

   WAS HIER EINGESTELLT WIRD  (und sonst nichts):
     $an        Wer die Anfragen bekommt
     $von       Absenderadresse. MUSS ein echtes Postfach auf derselben Domain
                sein, sonst stuft der Empfaenger die Mail als Spam ein.
                Wir nehmen bewusst dieselbe Adresse wie den Empfaenger: ein
                Postfach weniger, und es kann keins vergessen werden.
                Zum Antworten zaehlt ohnehin das Reply-To weiter unten, dort
                steht die Adresse der anfragenden Person.

   SICHERHEIT
   - Honigtopf: ein fuer Menschen unsichtbares Feld. Fuellt es jemand aus,
     war es ein Roboter, und wir tun so, als waere alles gut.
   - Zeitsperre: wer das Formular in unter drei Sekunden absendet, ist keiner.
   - Alle Werte werden von Zeilenumbruechen befreit, bevor sie in den Kopf der
     Mail kommen (sonst koennte jemand fremde Empfaenger einschmuggeln).
   - Es wird nichts gespeichert, keine Datenbank, keine Datei, kein Cookie.
   ============================================================================ */

$an  = 'praxis@kfo-marinello.de';  // Empfaenger der Anfragen (mit Admir abgestimmt, 01.10.2026)
$von = 'praxis@kfo-marinello.de';

date_default_timezone_set('Europe/Berlin');
header('Content-Type: application/json; charset=utf-8');

function ende($ok, $text = '') {
  echo json_encode(array('ok' => $ok, 'text' => $text), JSON_UNESCAPED_UNICODE);
  exit;
}
function sauber($wert) {
  $wert = isset($_POST[$wert]) ? (string) $_POST[$wert] : '';
  $wert = trim($wert);
  return mb_substr($wert, 0, 3000);
}
function einzeilig($wert) {
  return trim(preg_replace('/[\r\n]+/', ' ', $wert));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); ende(false, 'Nur POST.'); }

/* --- Roboterpruefung: stiller Erfolg, damit der Absender nichts lernt --- */
if (sauber('website') !== '') { ende(true); }
$start = (int) sauber('zeit');
if ($start > 0 && (time() - $start) < 3) { ende(true); }

/* --- Felder (passend zum Formular auf kontakt.html) --- */
$anrede    = einzeilig(sauber('anrede'));
$vorname   = einzeilig(sauber('vorname'));
$nachname  = einzeilig(sauber('nachname'));
$email     = einzeilig(sauber('email'));
$telefon   = einzeilig(sauber('telefon'));
$nachricht = sauber('nachricht');
$zustimmung = sauber('datenschutz');
$name      = trim($vorname . ' ' . $nachname);

/* Pflichtfelder, dritte von drei Pruefungen (Browser, skript.js, hier) */
if ($vorname === '' || $nachname === '' || $nachricht === '' || $zustimmung === '') { http_response_code(400); ende(false, 'Bitte füllen Sie die Pflichtfelder aus.'); }
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { http_response_code(400); ende(false, 'Bitte prüfen Sie die E-Mail-Adresse.'); }

/* --- Mail bauen --- */
$betreff = 'Anfrage über die Webseite: ' . $name;
$text  = "Anfrage über kfo-marinello.de\n\n";
if ($anrede !== '') { $text .= "Anrede:   $anrede\n"; }
$text .= "Name:     $name\n";
$text .= "E-Mail:   $email\n";
$text .= "Telefon:  " . ($telefon !== '' ? $telefon : '(nicht angegeben)') . "\n";
$text .= "\nNachricht:\n$nachricht\n";
$text .= "\n---\nGesendet am " . date('d.m.Y, H:i') . " Uhr.\n";
$text .= "Antworten Sie einfach auf diese Mail, das geht direkt an den Absender.\n";

$kopf  = 'From: Webseite Kieferorthopaedie Dr. Marinello <' . $von . ">\r\n";
$kopf .= 'Reply-To: ' . $name . ' <' . $email . ">\r\n";
$kopf .= "Content-Type: text/plain; charset=UTF-8\r\n";
$kopf .= "X-Mailer: PHP/" . phpversion();

$betreff_kodiert = '=?UTF-8?B?' . base64_encode($betreff) . '?=';

if (@mail($an, $betreff_kodiert, $text, $kopf, '-f' . $von)) {
  ende(true);
}
http_response_code(500);
ende(false, 'Die Anfrage konnte nicht verschickt werden. Bitte rufen Sie uns an: 06033 6 44 22');
