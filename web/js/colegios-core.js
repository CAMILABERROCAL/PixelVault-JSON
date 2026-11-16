/* Funciones puras compartidas por la página y las pruebas. */
(function (root) {
  'use strict';
  const normalizar = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const importe = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
  function criterios(colegio, filtro) {
    const checks = [];
    if (filtro.gestion) checks.push(colegio.gestion === filtro.gestion);
    if (filtro.nivel) checks.push(colegio.niveles.includes(filtro.nivel));
    if (filtro.min !== null || filtro.max !== null) {
      checks.push(colegio.gestion === 'publico' || (importe(colegio.pension) && (filtro.min === null || colegio.pension >= filtro.min) && (filtro.max === null || colegio.pension <= filtro.max)));
    }
    return { aciertos: checks.filter(Boolean).length, total: checks.length };
  }
  function seleccionar(colegios, filtro) {
    if ((filtro.min !== null && (!Number.isFinite(filtro.min) || filtro.min < 0)) || (filtro.max !== null && (!Number.isFinite(filtro.max) || filtro.max < 0))) throw new Error('El presupuesto debe ser un número mayor o igual a cero.');
    if (filtro.min !== null && filtro.max !== null && filtro.min > filtro.max) throw new Error('El importe mínimo no puede superar al máximo.');
    const texto = normalizar(filtro.texto).trim();
    const list = colegios.filter(c => normalizar([c.nombre,c.sede,c.direccion].join(' ')).includes(texto)).filter(c => {
      if (c.gestion === 'privado' && !importe(c.pension) && !filtro.incluirDesconocidos) return false;
      if (filtro.orden === 'ranking') return true;
      if (filtro.gestion && c.gestion !== filtro.gestion) return false;
      if (filtro.nivel && !c.niveles.includes(filtro.nivel)) return false;
      return c.gestion !== 'privado' || !importe(c.pension) || ((filtro.min === null || c.pension >= filtro.min) && (filtro.max === null || c.pension <= filtro.max));
    }).map(c => ({ ...c, coincidencia: criterios(c, filtro) }));
    return list.sort((a,b) => {
      if (filtro.orden === 'ranking' && a.coincidencia.aciertos !== b.coincidencia.aciertos) return b.coincidencia.aciertos - a.coincidencia.aciertos;
      if (filtro.orden === 'precio') {
        const pa = a.gestion === 'publico' ? 0 : importe(a.pension) ? a.pension : Infinity;
        const pb = b.gestion === 'publico' ? 0 : importe(b.pension) ? b.pension : Infinity;
        if (pa !== pb) return pa < pb ? -1 : 1;
      }
      return (a.nombre + a.sede).localeCompare(b.nombre + b.sede, 'es');
    });
  }
  function enlaceSeguro(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const url = new URL(value.trim());
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
    } catch { return ''; }
  }
  function imagenSegura(value) {
    if (typeof value !== 'string') return '';
    const local = /^\.\/img\/[a-zA-Z0-9_./-]+\.(svg|png|webp|jpe?g)$/i.test(value) && !value.includes('..');
    return local ? value : enlaceSeguro(value);
  }
  const api = { normalizar, importe, seleccionar, criterios, enlaceSeguro, imagenSegura };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ColegiosCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
