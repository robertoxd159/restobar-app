'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Star, 
  Calendar,
  ChevronRight,
  RefreshCcw
} from 'lucide-react';

export default function DashboardDueno() {
  const [autorizado, setAutorizado] = useState(false);
  const [pin, setPin] = useState('');
  const [stats, setStats] = useState({
    ventasTotales: 0,
    pedidosHoy: 0,
    ticketPromedio: 0,
    platosMasVendidos: [] as any[]
  });

  const [cargando, setCargando] = useState(false);

  const calcularEstadisticas = async () => {
    setCargando(true);
    // 1. Obtener pedidos completados de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('estado', 'completado')
      .gte('created_at', hoy.toISOString());

    if (pedidos) {
      const total = pedidos.reduce((acc, p) => acc + (p.total || 0), 0);
      const cantidad = pedidos.length;
      const promedio = cantidad > 0 ? total / cantidad : 0;

      // 2. Calcular platos más vendidos
      const conteoPlatos: any = {};
      pedidos.forEach(p => {
        p.items?.forEach((item: any) => {
          conteoPlatos[item.nombre] = (conteoPlatos[item.nombre] || 0) + item.cantidad;
        });
      });

      const ranking = Object.entries(conteoPlatos)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a: any, b: any) => b.cantidad - a.cantidad)
        .slice(0, 5);

      setStats({
        ventasTotales: total,
        pedidosHoy: cantidad,
        ticketPromedio: promedio,
        platosMasVendidos: ranking
      });
    }
    setCargando(false);
  };

  useEffect(() => {
    if (autorizado) {
      calcularEstadisticas();
      // Suscripción para actualizar si se completa un pago en vivo
      const channel = supabase.channel('db-stats')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' }, () => {
          calcularEstadisticas();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [autorizado]);

  if (!autorizado) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <TrendingUp size={32} className="text-white" />
          </div>
          <h2 className="text-white text-xl font-black uppercase italic mb-6">Admin Dashboard</h2>
          <input 
            type="password" 
            placeholder="PIN DE DUEÑO" 
            className="w-full p-4 rounded-2xl bg-white/10 border-none text-white text-center text-2xl outline-none focus:ring-2 ring-emerald-500 mb-4"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              if(e.target.value === '9999') setAutorizado(true); // Cambia este PIN para el dueño
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans pb-20">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase italic leading-none">Mi Negocio</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Resumen de Ventas Hoy</p>
        </div>
        <button onClick={calcularEstadisticas} className={`p-4 bg-white rounded-2xl shadow-sm border ${cargando && 'animate-spin'}`}>
          <RefreshCcw size={20} className="text-slate-600" />
        </button>
      </header>

      {/* Tarjetas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <DollarSign className="absolute -right-4 -bottom-4 text-white/10" size={120} />
          <p className="text-white/60 font-bold uppercase text-[10px] tracking-[0.2em] mb-2">Ventas del Día</p>
          <h2 className="text-4xl font-black">S/ {stats.ventasTotales.toFixed(2)}</h2>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-2">Pedidos Atendidos</p>
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-black text-slate-900">{stats.pedidosHoy}</h2>
            <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black italic">+ Hoy</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-2">Ticket Promedio</p>
          <h2 className="text-4xl font-black text-slate-900">S/ {stats.ticketPromedio.toFixed(1)}</h2>
        </div>
      </div>

      {/* Ranking de Platos */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
            <Star size={24} />
          </div>
          <h3 className="font-black text-xl uppercase italic">Platos Estrella</h3>
        </div>

        <div className="space-y-4">
          {stats.platosMasVendidos.length > 0 ? stats.platosMasVendidos.map((plato, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-full font-black text-xs italic">{index + 1}</span>
                <span className="font-bold text-slate-700 uppercase text-sm">{plato.nombre}</span>
              </div>
              <span className="font-black text-orange-600">{plato.cantidad} <span className="text-[10px] text-slate-400 uppercase">Vendidos</span></span>
            </div>
          )) : (
            <p className="text-center text-slate-400 py-10 font-bold italic">Aún no hay ventas registradas hoy</p>
          )}
        </div>
      </div>

      {/* Botón de Gestión */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <Users className="text-slate-400 group-hover:text-orange-600" />
            <span className="font-black uppercase italic text-xs">Gestión de Mozos</span>
          </div>
          <ChevronRight size={16} className="text-slate-300" />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <Calendar className="text-slate-400 group-hover:text-orange-600" />
            <span className="font-black uppercase italic text-xs">Historial Mensual</span>
          </div>
          <ChevronRight size={16} className="text-slate-300" />
        </div>
      </div>
    </div>
  );
}