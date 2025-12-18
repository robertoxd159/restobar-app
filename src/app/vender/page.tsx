'use client';
import { CheckCircle2, Zap, BarChart3, Smartphone, Clock, ShieldCheck } from 'lucide-react';

export default function PaginaVenta() {
  const whatsappNumber = "51923481905"; // PONE TU NÚMERO AQUÍ (Formato: 51 + número)

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Hero Section */}
      <header className="bg-slate-900 pt-20 pb-32 px-6 text-center">
        <div className="inline-block bg-orange-500/10 text-orange-500 border border-orange-500/20 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          Tecnología Gastronómica Real-Time
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-6 leading-none">
          Haz que tu Restobar <br /> <span className="text-orange-500">Vuele</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-lg mb-10">
          Digitaliza tu atención con pedidos QR que llegan al mozo y a la cocina en menos de 1 segundo. 
          Menos errores, más ventas.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <a href={`https://wa.me/${whatsappNumber}?text=Hola! Quiero la prueba gratis de 7 días`} className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-sm shadow-xl shadow-orange-900/20 hover:bg-orange-500 transition-all">
            Solicitar Prueba Gratis
          </a>
          <a href="/" className="bg-white/5 text-white border border-white/10 px-8 py-4 rounded-2xl font-black uppercase text-sm hover:bg-white/10 transition-all">
            Ver Demo en Vivo
          </a>
        </div>
      </header>

      {/* Beneficios */}
      <section className="py-24 px-6 max-w-6xl mx-auto -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Zap className="text-orange-500" />, title: "Tiempo Real", desc: "Los pedidos aparecen en la pantalla del mozo al instante. Sin retrasos." },
            { icon: <Smartphone className="text-orange-500" />, title: "PWA Instalable", desc: "Tus mozos tendrán una App en su celular sin descargar nada de la App Store." },
            { icon: <BarChart3 className="text-orange-500" />, title: "Control de Ventas", desc: "Dashboard exclusivo para el dueño. Mira tus ganancias desde cualquier lugar." }
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
              <div className="mb-4">{item.icon}</div>
              <h3 className="font-black uppercase italic text-lg mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="py-20 bg-slate-50 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black uppercase italic text-center mb-16">¿Por qué cambiar el papel por El Friki Cesar?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex gap-4">
              <CheckCircle2 className="text-emerald-500 shrink-0" />
              <div>
                <h4 className="font-bold mb-1">Cero Comisiones</h4>
                <p className="text-sm text-slate-500">A diferencia de otras apps, aquí el 100% de la venta es para ti.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock className="text-emerald-500 shrink-0" />
              <div>
                <h4 className="font-bold mb-1">Rotación de Mesas</h4>
                <p className="text-sm text-slate-500">Clientes atendidos más rápido significa más clientes por noche.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <ShieldCheck className="text-emerald-500 shrink-0" />
              <div>
                <h4 className="font-bold mb-1">Soporte Local</h4>
                <p className="text-sm text-slate-500">Estamos en Perú. Soporte técnico inmediato por WhatsApp.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="text-emerald-500 shrink-0" />
              <div>
                <h4 className="font-bold mb-1">Fácil de Usar</h4>
                <p className="text-sm text-slate-500">Tus mozos aprenderán a usarlo en menos de 5 minutos.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planes */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-black uppercase italic text-center mb-16">Planes a tu medida</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Plan Mensual */}
          <div className="border-4 border-slate-100 p-10 rounded-[3rem] hover:border-orange-500 transition-all group">
            <h3 className="font-black uppercase text-xl mb-2 italic">Plan Crecimiento</h3>
            <p className="text-slate-500 mb-6 text-sm">Ideal para negocios que están empezando.</p>
            <div className="text-4xl font-black mb-8">S/ 99 <span className="text-sm text-slate-400 font-normal tracking-normal">/mes</span></div>
            <ul className="space-y-4 mb-10 text-sm font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-orange-500"/> Mesas Ilimitadas</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-orange-500"/> Panel de Mozo y Cocina</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-orange-500"/> Soporte vía WhatsApp</li>
            </ul>
            <a href={`https://wa.me/${whatsappNumber}?text=Me interesa el Plan Mensual`} className="block text-center w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs group-hover:bg-orange-600 transition-colors">Elegir Mensual</a>
          </div>

          {/* Plan Vitalicio */}
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-orange-900/20">
            <div className="absolute top-6 right-6 bg-orange-600 text-[10px] font-black px-3 py-1 rounded-full uppercase italic">Más Popular</div>
            <h3 className="font-black uppercase text-xl mb-2 italic">Plan Dueño Real</h3>
            <p className="text-slate-400 mb-6 text-sm">Olvídate de las mensualidades para siempre.</p>
            <div className="text-4xl font-black mb-8 text-orange-500">S/ 1,800 <span className="text-sm text-white/40 font-normal tracking-normal">Pago Único</span></div>
            <ul className="space-y-4 mb-10 text-sm font-medium">
              <li className="flex items-center gap-2 text-white/80"><CheckCircle2 size={16} className="text-orange-500"/> Todo lo del plan mensual</li>
              <li className="flex items-center gap-2 text-white/80"><CheckCircle2 size={16} className="text-orange-500"/> Dashboard de Ganancias</li>
              <li className="flex items-center gap-2 text-white/80"><CheckCircle2 size={16} className="text-orange-500"/> Mantenimiento Técnico Anual</li>
            </ul>
            <a href={`https://wa.me/${whatsappNumber}?text=Me interesa el Plan de Pago Unico`} className="block text-center w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase text-xs hover:bg-orange-500 transition-colors">Adquirir de por vida</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 text-center border-t border-slate-200">
        <p className="font-black uppercase italic text-slate-400 text-xs">Desarrollado por TuNombre Software</p>
      </footer>
    </div>
  );
}