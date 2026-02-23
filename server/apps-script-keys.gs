/**
 * Apps Script (Web App) para validar claves únicas y acreditar puntos.
 * Hojas esperadas en el Spreadsheet:
 *  - Keys: key, retoId, puntos, meta, usado_por, usado_fecha
 *  - Evidencias: timestamp, nombre, retoId, puntos, meta
 *  - Leaderboard: nombre, puntos
 */

const SHEET_ID   = 'PEGAR_AQUI_SHEET_ID';
const KEYS_SHEET = 'Keys';
const EVI_SHEET  = 'Evidencias';
const LB_SHEET   = 'Leaderboard';
const SHARED_TOKEN = ''; // opcional, si quieres validar un token desde el frontend

function _ss(){ return SpreadsheetApp.openById(SHEET_ID); }
function _sh(name){ return _ss().getSheetByName(name) || _ss().insertSheet(name); }

function _findRowByValue(sheet, colIndex, value){
  const last = sheet.getLastRow();
  if(last < 1) return 0;
  const rng = sheet.getRange(1, colIndex, last);
  const vals = rng.getValues();
  for(let r=0;r<vals.length;r++){
    if(String(vals[r][0]).trim().toUpperCase() === String(value).trim().toUpperCase()) return r+1;
  }
  return 0;
}

function _ensureHeaders(){
  const ks = _sh(KEYS_SHEET); if(ks.getLastRow()===0){ ks.appendRow(['key','retoId','puntos','meta','usado_por','usado_fecha']); }
  const es = _sh(EVI_SHEET);  if(es.getLastRow()===0){ es.appendRow(['timestamp','nombre','retoId','puntos','meta']); }
  const lb = _sh(LB_SHEET);   if(lb.getLastRow()===0){ lb.appendRow(['nombre','puntos']); }
}

function doPost(e){
  try{
    _ensureHeaders();

    const mode  = (e.parameter.mode||'').trim();
    const token = (e.parameter.token||'').trim();
    if(SHARED_TOKEN && token !== SHARED_TOKEN){
      return ContentService.createTextOutput(JSON.stringify({ ok:false, error:'unauthorized' })).setMimeType(ContentService.MimeType.JSON);
    }

    if(mode === 'redeem_key'){
      const nombre = (e.parameter.nombre||'Anónimo').trim();
      const key    = (e.parameter.key||'').trim();
      if(!key){
        return ContentService.createTextOutput(JSON.stringify({ ok:false, error:'missing_key' })).setMimeType(ContentService.MimeType.JSON);
      }

      const ks = _sh(KEYS_SHEET);
      const keyRow = _findRowByValue(ks, 1, key);
      if(!keyRow){
        return ContentService.createTextOutput(JSON.stringify({ ok:false, error:'invalid_key' })).setMimeType(ContentService.MimeType.JSON);
      }
      const rowVals = ks.getRange(keyRow,1,1,6).getValues()[0];
      const retoId = String(rowVals[1]||'').trim() || 'R?';
      const puntos = Number(rowVals[2]||0);
      const meta   = String(rowVals[3]||'');
      const usadoPor = String(rowVals[4]||'');

      if(usadoPor){
        return ContentService.createTextOutput(JSON.stringify({ ok:false, error:'already_used' })).setMimeType(ContentService.MimeType.JSON);
      }

      // Marcar como usada
      ks.getRange(keyRow,5).setValue(nombre);
      ks.getRange(keyRow,6).setValue(new Date());

      // Registrar evidencia
      const es = _sh(EVI_SHEET);
      es.appendRow([new Date(), nombre, retoId, puntos, meta]);

      // Actualizar leaderboard (suma incremental)
      const lb = _sh(LB_SHEET);
      let lbRow = _findRowByValue(lb, 1, nombre);
      if(lbRow){
        const current = Number(lb.getRange(lbRow,2).getValue()||0);
        lb.getRange(lbRow,2).setValue(current + puntos);
      } else {
        lb.appendRow([nombre, puntos]);
      }

      // Total del usuario
      lbRow = _findRowByValue(lb, 1, nombre);
      const total = Number(lb.getRange(lbRow,2).getValue()||0);

      return ContentService.createTextOutput(JSON.stringify({ ok:true, puntos, retoId, meta, totalPuntos: total }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ ok:false, error:'unknown_mode' })).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({ ok:false, error:String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}
