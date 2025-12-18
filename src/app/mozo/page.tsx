'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Check, User, XCircle, DollarSign, RotateCcw } from 'lucide-react';

export default function PanelMozo() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState<number | null>(null);

  const fetchPedidos = async () => {
    // Solo traemos pedidos que no estén archivados y que necesiten atención o quieran pagar
    const { data } = await supabase
      .from('pedidos')
      .select('*')
      .eq('archivado', false)
      .or('estado.eq.por_confirmar,pide_cuenta.eq.true,estado.eq.pendiente')
      .order('created_at', { ascending: false });
    if (data) setPedidos(data);
  };

  useEffect(() => {
    fetchPedidos();
    const channel = supabase.channel('mozo-realtime').on('postgres_changes', 
      { event: '*', schema: 'public', table: 'pedidos' }, () => fetchPedidos()
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function confirmarPedido(id: number) {
    await supabase.from('pedidos').update({ estado: 'pendiente' }).eq('id', id);
    fetchPedidos();
  }

  async function cancelarPedido(id: number) {
    await supabase.from('pedidos').update({ estado: 'cancelado', archivado: true }).eq('id', id);
    setConfirmandoCancelacion(null);
    fetchPedidos();
  }

  async function marcarPagado(id: number) {
    // Al archivar el pedido, el cliente en su celular dejará de ver la opción de pedir cuenta
    await supabase.from('pedidos')
      .update({ 
        pide_cuenta: false, 
        estado: 'completado', 
        archivado: true 
      })
      .eq('id', id);
    fetchPedidos();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-2xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black italic uppercase text-slate-900 tracking-tighter leading-none">
            Panel <span className="text-orange-600">Servicio</span>
          </h1>
          <p className="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-widest">Atención en Tiempo Real</p>
        </header>

        <div className="grid gap-8">
          {pedidos.length === 0 ? (
            <div className="text-center py-24 text-slate-300 font-bold italic uppercase tracking-widest border-2 border-dashed border-slate-200 rounded-[3rem]">Sin pendientes</div>
          ) : (
            pedidos.map((p) => (
              <div key={p.id} className={`bg-white p-8 rounded-[3rem] shadow-xl border-2 transition-all duration-500 ${p.pide_cuenta ? 'border-emerald-500 ring-8 ring-emerald-50' : 'border-slate-100'}`}>
                
                {p.pide_cuenta && (
                  <div className="mb-6 bg-emerald-500 text-white p-4 rounded-2xl flex items-center justify-center gap-3 animate-bounce">
                    <DollarSign size={24} strokeWidth={4} />
                    <span className="font-black uppercase italic tracking-tighter">¡PIDE LA CUENTA!</span>
                  </div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="bg-slate-900 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Mesa {p.mesa}</span>
                    <h2 className="text-2xl font-black text-slate-800 mt-2 uppercase italic leading-none">{p.cliente}</h2>
                  </div>
                  <div className="text-right font-black text-orange-600 text-2xl italic leading-none">S/ {p.total?.toFixed(2)}</div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl mb-8 space-y-2 shadow-inner border border-slate-100">
                  {p.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between font-bold text-slate-600 text-sm">
                      <span className="uppercase italic">{item.nombre}</span>
                      <span className="bg-white px-3 py-0.5 rounded-lg border text-xs font-black">x{item.cantidad}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {p.estado === 'por_confirmar' && !confirmandoCancelacion && (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setConfirmandoCancelacion(p.id)} className="bg-red-50 text-red-500 p-4 rounded-2xl font-black text-[10px] uppercase border border-red-100 hover:bg-red-100 transition-colors">Cancelar</button>
                      <button onClick={() => confirmarPedido(p.id)} className="bg-orange-500 text-white p-4 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all">Aceptar Pedido</button>
                    </div>
                  )}

                  {confirmandoCancelacion === p.id && (
                    <div className="grid grid-cols-2 gap-3 animate-in zoom-in duration-300">
                      <button onClick={() => setConfirmandoCancelacion(null)} className="bg-slate-100 text-slate-500 p-4 rounded-2xl font-black text-[10px] uppercase">Atrás</button>
                      <button onClick={() => cancelarPedido(p.id)} className="bg-red-600 text-white p-4 rounded-2xl font-black text-[10px] uppercase shadow-lg">Confirmar</button>
                    </div>
                  )}
                  
                  {p.pide_cuenta && (
                    <button onClick={() => marcarPagado(p.id)} className="w-full bg-emerald-600 text-white p-6 rounded-[1.5rem] font-black uppercase text-sm shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                      <Check size={20} strokeWidth={3} /> FINALIZAR Y LIBERAR MESA
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}