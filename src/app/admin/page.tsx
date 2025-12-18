'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  PlusCircle, Trash2, Image as ImageIcon, 
  Tag, CheckCircle2, XCircle, UtensilsCrossed 
} from 'lucide-react';

export default function AdminCarta() {
  const [productos, setProductos] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [categoria, setCategoria] = useState('Comida');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    const { data } = await supabase
      .from('productos')
      .select('*')
      .order('categoria', { ascending: true });
    if (data) setProductos(data);
  }

  async function guardarProducto(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !precio) return alert("Nombre y precio son obligatorios");

    setCargando(true);
    const { error } = await supabase.from('productos').insert([{ 
        nombre, 
        precio: parseFloat(precio), 
        imagen_url: imgUrl,
        categoria,
        disponible: true
    }]);

    if (!error) {
      setNombre('');
      setPrecio('');
      setImgUrl('');
      fetchProductos();
    } else {
      alert("Error: " + error.message);
    }
    setCargando(false);
  }

  async function toggleDisponibilidad(id: number, estadoActual: boolean) {
    const { error } = await supabase
      .from('productos')
      .update({ disponible: !estadoActual })
      .eq('id', id);
    
    if (!error) fetchProductos();
  }

  async function eliminarProducto(id: number) {
    if (confirm("¿Estás seguro de eliminar este plato de la carta?")) {
      await supabase.from('productos').delete().eq('id', id);
      fetchProductos();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">
              Control de <span className="text-orange-600">Carta</span>
            </h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Gestión de productos y disponibilidad</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-black uppercase tracking-widest">Base de Datos Conectada</span>
          </div>
        </header>

        {/* FORMULARIO DE REGISTRO */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 mb-12">
          <form onSubmit={guardarProducto} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nombre del Producto</label>
                <input 
                  value={nombre} onChange={(e) => setNombre(e.target.value)} 
                  type="text" placeholder="Ej: Lomo Saltado" 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none border focus:border-orange-500 font-bold transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Precio (S/)</label>
                <input 
                  value={precio} onChange={(e) => setPrecio(e.target.value)} 
                  type="number" step="0.1" placeholder="0.00" 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none border focus:border-orange-500 font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Categoría</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-4 text-slate-300" size={18} />
                  <select 
                    value={categoria} onChange={(e) => setCategoria(e.target.value)}
                    className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none border focus:border-orange-500 font-bold appearance-none cursor-pointer"
                  >
                    <option value="Comida">🍴 Comida</option>
                    <option value="Postre">🍰 Postre</option>
                    <option value="Bebidas">🥤 Bebidas</option>
                    <option value="Bebidas Alcoholicas">🍺 Alcohólicas</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">URL Imagen</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-4 text-slate-300" size={18} />
                  <input 
                    value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} 
                    type="text" placeholder="https://..." 
                    className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none border focus:border-orange-500 font-medium text-sm"
                  />
                </div>
              </div>

            </div>

            <button 
              disabled={cargando}
              type="submit" 
              className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.99] disabled:opacity-50"
            >
              <PlusCircle size={24} /> AGREGAR A LA CARTA
            </button>
          </form>
        </section>

        {/* TABLA DE PRODUCTOS */}
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Imagen</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Precio</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productos.map((p) => (
                  <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${!p.disponible && 'bg-slate-50/30'}`}>
                    <td className="p-6 w-24">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                        <img 
                          src={p.imagen_url || 'https://via.placeholder.com/150?text=No+Imagen'} 
                          className={`w-full h-full object-cover ${!p.disponible && 'grayscale'}`} 
                        />
                      </div>
                    </td>
                    <td className="p-6">
                      <p className={`font-black text-slate-800 uppercase italic ${!p.disponible && 'line-through text-slate-400'}`}>
                        {p.nombre}
                      </p>
                      <span className="text-[9px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-400 uppercase tracking-tighter">
                        {p.categoria}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <button 
                        onClick={() => toggleDisponibilidad(p.id, p.disponible)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all border ${
                          p.disponible 
                          ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' 
                          : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        {p.disponible ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {p.disponible ? 'Disponible' : 'Agotado'}
                      </button>
                    </td>
                    <td className="p-6 text-right">
                      <span className="font-black text-orange-600 italic text-lg">S/ {p.precio.toFixed(2)}</span>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => eliminarProducto(p.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {productos.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <UtensilsCrossed className="text-slate-200" size={60} />
              <p className="text-slate-400 font-bold italic uppercase tracking-widest text-sm">Tu carta está vacía</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}