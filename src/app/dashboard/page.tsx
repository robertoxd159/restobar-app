'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, DollarSign, Package, BarChart3, 
  RefreshCcw, Calendar, CheckCircle2, History, X, AlertTriangle
} from 'lucide-react';

export default function DashboardVentas() {
  const [metricas, setMetricas] = useState({ totalVentas: 0, cantidadPedidos: 0, ticketPromedio: 0 });
  const [topProductos, setTopProductos] = useState<any[]>([]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarModalCierre, setMostrarModalCierre] = useState(false);

  const fetchData = async () => {
    setCargando(true);
    // 1. Datos del turno actual
    const { data: pedidos } = await supabase.from('pedidos').select('*').eq('estado', 'completado').eq('archivado', false);
    if (pedidos) {
      const total = pedidos.reduce((acc, p) => acc + (p.total || 0), 0);
      const cantidad = pedidos.length;
      setMetricas({ totalVentas: total, cantidadPedidos: cantidad, ticketPromedio: cantidad > 0 ? total / cantidad : 0 });
      
      const conteo: any = {};
      pedidos.forEach(p => p.items?.forEach((item: any) => {
        conteo[item.nombre] = (conteo[item.nombre] || 0) + (item.cantidad || 1);
      }));
      const top = Object.entries(conteo).map(([nombre, cantidad]) => ({ nombre, cantidad: cantidad as number })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
      setTopProductos(top);
    }

    // 2. Cargar historial de cierres
    const { data: cierres } = await supabase.from('cierres_caja').select('*').order('fecha', { ascending: false }).limit(10);
    if (cierres) setHistorial(cierres);
    
    setCargando(false);
  };

  const ejecutarCierreCaja = async () => {
    setCargando(true);
    // Guardar en historial
    await supabase.from('cierres_caja').insert([{
      total_venta: metricas.totalVentas,
      pedidos_cantidad: metricas.cantidadPedidos,
      cerrado_por: 'Administrador'
    }]);

    // Archivar pedidos
    await supabase.from('pedidos').update({ archivado: true }).eq('estado', 'completado').eq('archivado', false);

    setMostrarModalCierre(false);
    fetchData();
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">Business <span className="text-orange-600">Stats</span></h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
              <Calendar size={12} /> Turno Actual
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={fetchData} className="bg-white p-4 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm transition-all">
              <RefreshCcw size={20} className={cargando ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setMostrarModalCierre(true)} className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-xl flex items-center justify-center gap-3">
              <CheckCircle2 size={18} /> Cierre de Turno
            </button>
          </div>
        </header>

        {/* MÉTRICAS (Igual que antes pero pulido) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Ganancia Turno</p>
                <h2 className="text-4xl font-black italic text-slate-900 leading-none">S/ {metricas.totalVentas.toFixed(2)}</h2>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 font-black italic text-4xl">
                <p className="text-[10px] font-black text-slate-400 uppercase not-italic mb-2">Ventas</p>
                {metricas.cantidadPedidos}
            </div>
            <div className="bg-orange-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-orange-100">
                <p className="text-[10px] font-black text-white/60 uppercase mb-2">Promedio</p>
                <h2 className="text-4xl font-black italic leading-none">S/ {metricas.ticketPromedio.toFixed(2)}</h2>
            </div>
        </div>

        {/* SECCIÓN DOBLE: RANKING Y HISTORIAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* RANKING */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
              <BarChart3 className="text-orange-500" />
              <h3 className="font-black italic text-xl uppercase">Top 5 Platos</h3>
            </div>
            <div className="space-y-6">
              {topProductos.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                  <span className="font-bold text-slate-700 uppercase text-sm">{item.nombre}</span>
                  <span className="bg-slate-900 text-white px-3 py-1 rounded-full font-black text-xs">{item.cantidad}</span>
                </div>
              ))}
            </div>
          </div>

          {/* HISTORIAL DE GANANCIAS ANTIGUAS */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
              <History className="text-slate-400" />
              <h3 className="font-black italic text-xl uppercase">Cierres Pasados</h3>
            </div>
            <div className="overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {historial.map((c) => (
                <div key={c.id} className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase">{new Date(c.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-[10px] font-bold text-slate-300">Pedidos: {c.pedidos_cantidad}</p>
                  </div>
                  <div className="font-black italic text-emerald-600 text-lg">S/ {c.total_venta.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL DE CIERRE (SIN ALERTS) */}
        {mostrarModalCierre && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in duration-300">
              <button onClick={() => setMostrarModalCierre(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors"><X /></button>
              <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 text-center uppercase mb-4 italic">¿Cerrar turno de hoy?</h2>
              <div className="bg-slate-50 p-6 rounded-3xl mb-8 text-center border border-slate-100 shadow-inner">
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Monto a archivar</p>
                <p className="text-3xl font-black text-slate-900 italic">S/ {metricas.totalVentas.toFixed(2)}</p>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={ejecutarCierreCaja} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase text-sm shadow-xl hover:bg-emerald-600 transition-all">SÍ, CONFIRMAR CIERRE</button>
                <button onClick={() => setMostrarModalCierre(false)} className="w-full text-slate-400 font-black uppercase text-[10px] py-2 hover:text-slate-600 transition-colors tracking-widest">CANCELAR</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}