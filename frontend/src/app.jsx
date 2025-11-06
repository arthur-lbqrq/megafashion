import { useEffect, useState } from 'react';
// 5 vendedoras da loja geral
const SELLERS = [
    'Vendedora 1',
    'Vendedora 2',
    'Vendedora 3',
    'Vendedora 4',
    'Vendedora 5'
];


const PAYMENT_METHODS = ['dinheiro', 'cartao', 'pix'];


export default function App(){
    const [seller, setSeller] = useState(SELLERS[0]);
    const [amount, setAmount] = useState('');
    const [payment, setPayment] = useState(PAYMENT_METHODS[0]);
    const [summary, setSummary] = useState({ perSeller: [], total: 0 });
    const [loading, setLoading] = useState(false);


    const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';


    const fetchSummary = async () => {
        try{
            const res = await fetch(`${API}/api/summary`);
            const data = await res.json();
            setSummary(data);
        }catch(err){
            console.error(err);
        }
    }


    useEffect(()=>{ fetchSummary(); }, []);


    const submit = async (e) =>{
        e.preventDefault();
        if(!amount || isNaN(Number(amount))) return alert('Valor inválido');
        setLoading(true);
        try{
            const res = await fetch(`${API}/api/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seller, amount: Number(amount), payment_method: payment })
            });
            const json = await res.json();
            if(json.ok){
                setAmount('');
                fetchSummary();
            } else {
                alert('Erro: ' + (json.error || 'desconhecido'));
            }
        }catch(err){
            console.error(err);
            alert('Erro ao conectar com a API');
        }   finally { setLoading(false); }
    }
    const exportCsv = async () => {
        try{
            const res = await fetch(`${API}/api/sales`);
            const rows = await res.json();
            const csv = ['id,seller,amount,payment_method,created_at', ...rows.map(r=>`${r.id},"${r.seller}",${r.amount},${r.payment_method},${r.created_at}`)].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'sales.csv'; a.click();
            URL.revokeObjectURL(url);
        }catch(err){ console.error(err); alert('Erro ao exportar'); }
    }


    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl p-6">
                <h1 className="text-2xl md:text-3xl font-semibold mb-4">MegaFashion — Registro rápido de vendas</h1>


                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                    <div className="md:col-span-1">
                        <label className="block text-sm">Vendedora</label>
                        <select value={seller} onChange={e=>setSeller(e.target.value)} className="mt-1 block w-full rounded p-2 border">
                            {SELLERS.map(s=> <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>


                    <div>
                        <label className="block text-sm">Valor (R$)</label>
                        <input value={amount} onChange={e=>setAmount(e.target.value)} className="mt-1 block w-full rounded p-2 border" placeholder="0.00" />
                    </div>


                    <div>
                        <label className="block text-sm">Forma</label>
                        <select value={payment} onChange={e=>setPayment(e.target.value)} className="mt-1 block w-full rounded p-2 border">
                            {PAYMENT_METHODS.map(p=> <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>


                    <div className="md:col-span-3 flex gap-2 mt-2">
                        <button disabled={loading} className="px-4 py-2 rounded bg-indigo-600 text-white">Registrar venda</button>
                        <button type="button" onClick={fetchSummary} className="px-4 py-2 rounded border">Atualizar resumo</button>
                        <button type="button" onClick={exportCsv} className="px-4 py-2 rounded border">Exportar CSV</button>
                    </div>
                </form>


                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded">
                        <h2 className="font-semibold mb-2">Resumo por vendedora</h2>
                        <ul>
                            {summary.perSeller && summary.perSeller.length > 0 ? (
                                summary.perSeller.map(s => (
                                    <li key={s.seller} className="flex justify-between py-1">
                                        <span>{s.seller}</span>
                                        <span>R$ {Number(s.total).toFixed(2)}</span>
                                    </li>
                                ))
                            ) : (<li className="text-sm text-gray-500">Nenhuma venda registrada ainda.</li>)}
                        </ul>
                    </div>


                    <div className="p-4 border rounded">
                        <h2 className="font-semibold mb-2">Total geral</h2>
                        <div className="text-3xl font-bold">R$ {Number(summary.total || 0).toFixed(2)}</div>
                        <div className="mt-2 text-sm text-gray-600">Período: todas as vendas (use filtros no backend se precisar)</div>
                    </div>
                </section>


            </div>


            <footer className="max-w-4xl mx-auto mt-6 text-sm text-gray-500">MegaFashion · Sistema ágil para registro de vendas — 20 a 24 de novembro</footer>
        </div>
    );
}