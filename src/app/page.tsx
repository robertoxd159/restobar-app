'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Send, Plus, Minus, Lock, Pizza, Cake, Coffee, 
  Beer, Check, AlertTriangle, CreditCard 
} from 'lucide-react';

function MenuContenido() {
  const searchParams = useSearchParams();
  const mesaURL = searchParams.get('m'); 
  const tokenURL = searchParams.get('t'); 

  const [menuOriginal, setMenuOriginal] = useState<any[]>([]);
  const [menuFiltrado, setMenuFiltrado] = useState<any[]>([]);
  const [catSeleccionada, setCatSeleccionada] = useState('Comida');
  const [carrito, setCarrito] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [accesoValido, setAccesoValido] = useState<boolean | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [pedidoExitoso, setPedidoExitoso] = useState(false);
  const [errorNombre, setErrorNombre] = useState(false);
  const [cuentaPedida, setCuentaPedida] = useState(false);

  const categorias = [
    { id: 'Comida', icon: <Pizza size={18} /> },
    { id: 'Postre', icon: <Cake size={18} /> },
    { id: 'Bebidas', icon: <Coffee size={18} /> },
    { id: 'Bebidas Alcoholicas', icon: <Beer size={18} /> },
  ];

  // 1. FUNCIÓN PARA CARGAR EL MENÚ
  const fetchMenu = async () => {
    const { data } = await supabase.from('productos').select('*').order('nombre');
    if (data) {
      setMenuOriginal(data);
    }
  };

  useEffect(() => {
    if (mesaURL && tokenURL === "roberto99") setAccesoValido(true);
    else setAccesoValido(false);
  }, [mesaURL, tokenURL]);

  useEffect(() => {
    if (accesoValido) {
      fetchMenu();

      // --- TIEMPO REAL: ESCUCHAR CAMBIOS EN PRODUCTOS (STOCK) ---
      const canalProductos = supabase
        .channel('cambios-stock')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, 
        () => {
          fetchMenu(); // Si cambia algo en productos, recargar menú
        })
        .subscribe();

      // --- TIEMPO REAL: ESCUCHAR CIERRE DE MESA ---
      const canalMesa = supabase
        .channel('mesa-libre')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `mesa=eq.${mesaURL}` }, 
        (payload) => {
          if (payload.new.archivado === true) {
            setCuentaPedida(false);
            setPedidoExitoso(false);
            window.location.reload();
          }
        })
        .subscribe();

      return () => { 
        supabase.removeChannel(canalProductos);
        supabase.removeChannel(canalMesa);
      };
    }
  }, [accesoValido, mesaURL]);

  // Filtrar cada vez que cambie la categoría o el menú original
  useEffect(() => {
    setMenuFiltrado(menuOriginal.filter(p => p.categoria === catSeleccionada));
  }, [catSeleccionada, menuOriginal]);

  const modificarCantidad = (plato: any, accion: 'sumar' | 'restar') => {
    // Si el producto se acaba de agotar en tiempo real, no permitir sumar
    const productoActualizado = menuOriginal.find(p => p.id === plato.id);
    if (productoActualizado && !productoActualizado.disponible && accion === 'sumar') return;

    const existe = carrito.find(item => item.id === plato.id);
    if (accion === 'sumar') {
      existe 
        ? setCarrito(carrito.map(i => i.id === plato.id ? { ...i, cantidad: i.cantidad + 1 } : i))
        : setCarrito([...carrito, { ...plato, cantidad: 1 }]);
    } else {
      existe?.cantidad > 1 
        ? setCarrito(carrito.map(i => i.id === plato.id ? { ...i, cantidad: i.cantidad - 1 } : i))
        : setCarrito(carrito.filter(i => i.id !== plato.id));
    }
  };

  const enviarPedido = async () => {
    setErrorNombre(false);
    if (!nombre.trim()) { setErrorNombre(true); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setEnviando(true);
    const total = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    const { error } = await supabase.from('pedidos').insert([
      { cliente: nombre, mesa: mesaURL, items: carrito, total, estado: 'por_confirmar' }
    ]);
    if (!error) { setPedidoExitoso(true); setCarrito([]); setNombre(''); }
    setEnviando(false);
  };

  const solicitarCuenta = async () => {
    if (cuentaPedida) return;
    const { error } = await supabase.from('pedidos').update({ pide_cuenta: true }).eq('mesa', mesaURL).eq('archivado', false);
    if (!error) setCuentaPedida(true);
  };

  if (accesoValido === false) return (
    <div className="h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-200 max-w-sm">
        <Lock className="mx-auto mb-6 text-red-500" size={50} />
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase italic tracking-tighter">Acceso Restringido</h2>
        <p className="text-slate-500 text-sm font-medium">Escanea el código QR de tu mesa.</p>
      </div>
    </div>
  );

  if (pedidoExitoso) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
      <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl animate-bounce">
        <Check size={48} strokeWidth={4} />
      </div>
      <h2 className="text-4xl font-black italic text-slate-900 mb-4 uppercase tracking-tighter leading-none">¡Pedido <span className="text-orange-600">Recibido!</span></h2>
      <button onClick={() => setPedidoExitoso(false)} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-sm shadow-xl transition-all">Hacer otro pedido</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-40 font-sans text-slate-900">
      <style>{` @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } } .animate-shake { animation: shake 0.2s ease-in-out 0s 2; } `}</style>

      <button 
        onClick={solicitarCuenta}
        disabled={cuentaPedida}
        className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-[10px] uppercase shadow-2xl transition-all ${cuentaPedida ? 'bg-emerald-500 text-white scale-95 opacity-80' : 'bg-white text-slate-900 border border-slate-200 hover:scale-105'}`}
      >
        <CreditCard size={16} /> {cuentaPedida ? 'Cuenta Solicitada' : 'Pedir Cuenta'}
      </button>

      <header className="pt-10 pb-4 bg-slate-50/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/50">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h1 className="text-3xl font-black italic tracking-tighter mb-1 uppercase">SABORES <span className="text-orange-600">PERÚ</span></h1>
          <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">MESA {mesaURL}</div>
          <div className="flex justify-start md:justify-center gap-3 overflow-x-auto py-2 no-scrollbar">
            {categorias.map((cat) => (
              <button key={cat.id} onClick={() => setCatSeleccionada(cat.id)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${catSeleccionada === cat.id ? 'bg-orange-600 text-white border-orange-600 shadow-lg' : 'bg-white text-slate-500 border-slate-200'}`}>
                {cat.icon} {cat.id}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="mb-12 max-w-md mx-auto relative text-center">
          {errorNombre && <div className="mb-2"><span className="text-red-500 font-black text-[10px] uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">⚠️ Por favor, escribe tu nombre</span></div>}
          <input type="text" placeholder="¿A nombre de quién?" className={`w-full p-5 rounded-[2rem] border shadow-sm outline-none font-bold text-center transition-all text-lg ${errorNombre ? 'border-red-500 ring-4 ring-red-50 animate-shake bg-red-50/30' : 'bg-white border-slate-200 focus:ring-4 ring-orange-100'}`} value={nombre} onChange={(e) => { setNombre(e.target.value); if(errorNombre) setErrorNombre(false); }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {menuFiltrado.map((plato) => {
            const item = carrito.find(i => i.id === plato.id);
            return (
              <div key={plato.id} className={`bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col group transition-all duration-300 ${!plato.disponible && 'grayscale opacity-60'}`}>
                <div className="relative h-60 overflow-hidden">
                  <img src={plato.imagen_url || 'https://via.placeholder.com/400'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={plato.nombre} />
                  <div className="absolute top-6 right-6 bg-white/95 backdrop-blur px-5 py-2 rounded-full font-black text-orange-600 shadow-sm italic text-lg">S/ {plato.precio.toFixed(2)}</div>
                  {!plato.disponible && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-red-600 text-white px-6 py-2 rounded-full font-black uppercase italic -rotate-12 shadow-2xl">Agotado</span>
                    </div>
                  )}
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between items-center text-center">
                  <h3 className="font-bold text-2xl text-slate-800 mb-6 leading-tight uppercase italic">{plato.nombre}</h3>
                  {plato.disponible ? (
                    <div className="flex items-center gap-6 bg-slate-50 p-2 rounded-[2rem] border border-slate-100">
                      {item && (
                        <>
                          <button onClick={() => modificarCantidad(plato, 'restar')} className="bg-white p-3 rounded-2xl text-red-500 shadow-sm border border-slate-100"><Minus size={20} /></button>
                          <span className="font-black text-2xl w-8 text-slate-700">{item.cantidad}</span>
                        </>
                      )}
                      <button onClick={() => modificarCantidad(plato, 'sumar')} className="bg-orange-500 p-3 rounded-2xl text-white shadow-xl hover:bg-orange-600 active:scale-90 transition-all"><Plus size={20} /></button>
                    </div>
                  ) : <span className="text-red-500 font-black italic uppercase text-xs">No disponible por hoy</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {carrito.length > 0 && (
        <div className="fixed bottom-8 left-0 w-full px-6 z-50 flex justify-center">
          <button disabled={enviando} onClick={enviarPedido} className="w-full max-w-lg bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl flex justify-between items-center active:scale-95 transition-all">
            <div className="flex items-center gap-5">
              <div className="bg-orange-500 w-14 h-14 rounded-full flex items-center justify-center font-black text-xl">{carrito.reduce((acc, p) => acc + p.cantidad, 0)}</div>
              <div className="text-left font-black italic text-white text-2xl">S/ {carrito.reduce((acc,p)=>acc+(p.precio*p.cantidad),0).toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-3 font-black italic bg-orange-600 px-8 py-4 rounded-[1.5rem]">PEDIR <Send size={20} /></div>
          </button>
        </div>
      )}
    </div>
  );
}

export default function PaginaFinal() { return (<Suspense fallback={<div>Cargando...</div>}><MenuContenido /></Suspense>); }