'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Check, 
  XCircle, 
  DollarSign, 
  Bell, 
  BellOff, 
  ChefHat, 
  User, 
  Clock 
} from 'lucide-react';

export default function PanelMozo() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [totalPendientes, setTotalPendientes] = useState(0);
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState<number | null>(null);
  const [sonidoHabilitado, setSonidoHabilitado] = useState(false);
  
  // Usamos una referencia para comparar el total de pedidos sin causar bucles
  const prevPedidosCount = useRef(0);

  const fetchPedidos = async () => {
    const { data } = await supabase
      .from('pedidos')
      .select('*')
      .eq('archivado', false)
      .or('estado.eq.por_confirmar,pide_cuenta.eq.true,estado.eq.pendiente')
      .order('created_at', { ascending: false });

    if (data) {
      // Lógica de Alerta: Si hay más pedidos "por_confirmar" que antes
      const nuevos = data.filter(p => p.estado === 'por_confirmar').length;
      if (nuevos > prevPedidosCount.current) {
        ejecutarAlerta();
      }
      prevPedidosCount.current = nuevos;
      setPedidos(data);
      setTotalPendientes(nuevos);
    }
  };

  const ejecutarAlerta = () => {
    // 1. Vibración (Funciona en Android y PWAs instaladas)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }

    // 2. Sonido (Solo si el usuario habilitó el sonido con un clic previo)
    if (sonidoHabilitado) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.play().catch(e => console.log("Audio bloqueado por el navegador"));
    }
  };

  useEffect(() => {
    fetchPedidos();

    // Suscripción Realtime
    const channel = supabase.channel('mozo-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        fetchPedidos();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sonidoHabilitado]);

  // Funciones de acción
  const confirmarPedido = async (id: number) => {
    await supabase.from('pedidos').update({ estado: 'pendiente' }).eq('id', id);
  };

  const cancelarPedido = async (id: number) => {
    await supabase.from('pedidos').update({ estado: 'cancelado', archivado: true }).eq('id', id);
    setConfirmandoCancelacion(null);
  };

  const marcarPagado = async (id: number) => {
    await supabase.from('pedidos').update({ pide_cuenta: false, estado: 'completado', archivado: true }).eq('id', id);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Header Fijo con Switch de Sonido */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black italic uppercase text-slate-900 tracking-tighter">
            Servicio <span className="text-orange-600">En Vivo</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Panel Conectado</span>
          </div>
        </div>

        <button 
          onClick={() => setSonidoHabilitado(!sonidoHabilitado)}
          className={`p-3 rounded-2xl transition-all ${sonidoHabilitado ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}
        >
          {sonidoHabilitado ? <Bell size={20} /> : <BellOff size={20} />}
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        {/* Resumen de Estado */}
        {totalPendientes > 0 && (
          <div className="mb-8 bg-orange-500 text-white p-6 rounded-[2rem] shadow-lg shadow-orange-200 flex justify-between items-center">
            <div className="font-black italic uppercase text-lg">Tienes {totalPendientes} {totalPendientes === 1 ? 'pedido nuevo' : 'pedidos nuevos'}</div>
            <ChefHat size={32} className="opacity-50" />
          </div>
        )}

        <div className="grid gap-8">
          {pedidos.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 text-slate-200">
                <Check size={40} />
              </div>
              <p className="text-slate-400 font-bold uppercase italic text-sm tracking-widest">No hay nada pendiente</p>
            </div>
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
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Mesa {p.mesa}</span>
                      {p.estado === 'por_confirmar' && <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Nuevo</span>}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase italic flex items-center gap-2">
                      <User size={20} className="text-slate-300" /> {p.cliente}
                    </h2>
                  </div>
                  <div className="text-right font-black text-slate-900 text-2xl italic">S/ {p.total?.toFixed(2)}</div>
                </div>

                {/* Lista de platos comprimida */}
                <div className="bg-slate-50 p-5 rounded-2xl mb-8 space-y-2 border border-slate-100">
                  {p.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between font-bold text-slate-600">
                      <span className="uppercase text-sm italic">{item.nombre}</span>
                      <span className="text-orange-600">x{item.cantidad}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {p.estado === 'por_confirmar' && !confirmandoCancelacion && (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setConfirmandoCancelacion(p.id)} className="bg-white text-red-500 p-5 rounded-2xl font-black text-xs uppercase border-2 border-red-50 hover:bg-red-50 transition-colors">Cancelar</button>
                      <button onClick={() => confirmarPedido(p.id)} className="bg-orange-500 text-white p-5 rounded-2xl font-black text-xs uppercase shadow-lg shadow-orange-100 hover:bg-orange-600 active:scale-95 transition-all">Aceptar</button>
                    </div>
                  )}

                  {confirmandoCancelacion === p.id && (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setConfirmandoCancelacion(null)} className="bg-slate-100 text-slate-500 p-5 rounded-2xl font-black text-xs uppercase">Atrás</button>
                      <button onClick={() => cancelarPedido(p.id)} className="bg-red-600 text-white p-5 rounded-2xl font-black text-xs uppercase">Sí, Cancelar</button>
                    </div>
                  )}
                  
                  {p.pide_cuenta && (
                    <button onClick={() => marcarPagado(p.id)} className="w-full bg-emerald-600 text-white p-6 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                      <Check size={20} strokeWidth={4} /> FINALIZAR Y LIBERAR MESA
                    </button>
                  )}

                  {p.estado === 'pendiente' && !p.pide_cuenta && (
                    <div className="text-center py-2 flex items-center justify-center gap-2 text-slate-400 font-black text-[10px] uppercase italic tracking-widest border border-dashed border-slate-200 rounded-xl">
                      <Clock size={12} /> Esperando cocina o pago
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}