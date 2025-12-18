'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Clock, UtensilsCrossed, AlertCircle } from 'lucide-react';

export default function PanelCocina() {
  const [pedidosCocina, setPedidosCocina] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // 1. Función para traer pedidos que el mozo ya confirmó
  const fetchPedidosCocina = async () => {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('estado', 'pendiente') // 'pendiente' significa confirmado por mozo, listo para cocinar
      .eq('archivado', false)
      .order('created_at', { ascending: true }); // Los más antiguos primero (orden de llegada)
    
    if (data) setPedidosCocina(data);
    setCargando(false);
  };

  // 2. CONFIGURACIÓN TIEMPO REAL
  useEffect(() => {
    fetchPedidosCocina();

    // Suscripción a cambios en la tabla 'pedidos'
    const canalCocina = supabase
      .channel('cambios-cocina')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pedidos' }, 
        (payload) => {
          console.log("Cambio detectado en cocina:", payload);
          fetchPedidosCocina(); // Recarga automático al detectar cualquier cambio
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalCocina);
    };
  }, []);

  // 3. Función para marcar como entregado
  async function despacharPedido(id: number) {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: 'entregado' }) // Pasa a estado entregado
      .eq('id', id);
    
    if (error) alert("Error al despachar");
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-6 md:p-10 font-sans text-white">
      <header className="mb-10 flex justify-between items-center border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3">
            <UtensilsCrossed className="text-orange-500" size={36} />
            Ordenes <span className="text-orange-500">Cocina</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Monitor de producción en tiempo real</p>
        </div>
        <div className="bg-zinc-800 px-6 py-2 rounded-full flex items-center gap-3 border border-zinc-700">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black uppercase tracking-tight text-emerald-500">Sistema Online</span>
        </div>
      </header>

      {pedidosCocina.length === 0 && !cargando ? (
        <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-700">
          <CheckCircle2 size={80} strokeWidth={1} className="mb-4 opacity-20" />
          <p className="text-xl font-black italic uppercase tracking-widest opacity-20">Todo despachado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pedidosCocina.map((p) => (
            <div key={p.id} className="bg-zinc-800 border-l-8 border-orange-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-500">
              {/* Info de Mesa y Tiempo */}
              <div className="p-6 border-b border-zinc-700 flex justify-between items-center bg-zinc-800/50">
                <div>
                  <span className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Mesa</span>
                  <span className="text-4xl font-black italic leading-none">{p.mesa}</span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-orange-500 mb-1 justify-end">
                    <Clock size={14} />
                    <span className="text-[10px] font-black uppercase">Hace {Math.floor((new Date().getTime() - new Date(p.created_at).getTime()) / 60000)} min</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-400 uppercase italic tracking-tight">{p.cliente}</span>
                </div>
              </div>

              {/* Lista de Platos (GRANDE PARA EL CHEF) */}
              <div className="p-8 flex-1">
                <ul className="space-y-6">
                  {p.items?.map((item: any, i: number) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="bg-white text-zinc-900 w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shrink-0">
                        {item.cantidad}
                      </span>
                      <span className="text-2xl font-black uppercase italic tracking-tighter leading-tight text-zinc-100 pt-1">
                        {item.nombre}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botón de Despacho */}
              <button 
                onClick={() => despacharPedido(p.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-6 uppercase italic tracking-tighter text-xl transition-colors flex items-center justify-center gap-3 group"
              >
                TERMINADO
                <CheckCircle2 className="group-hover:scale-125 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}