import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, Printer, ArrowLeft, Package, MapPin, Globe, CreditCard } from 'lucide-react';

const Invoice = () => {
    const { awb } = useParams();
    const navigate = useNavigate();
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShipment = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/shipments/${awb}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setShipment(res.data.shipment);
            } catch (err) {
                console.error("Failed to fetch shipment for invoice", err);
                // Mock data for demo
                setShipment({
                    local_awb: awb,
                    sender_name: 'Rajan Kumar',
                    sender_address: '123 Main St, Delhi, India - 110001',
                    sender_phone: '+91 98765 43210',
                    receiver_name: 'Amit Sharma',
                    receiver_address: '456 Park Ave, Mumbai, Maharashtra - 400001',
                    receiver_phone: '+91 91234 56789',
                    created_at: new Date().toISOString(),
                    price: 450,
                    weight: 2.5,
                    courier_owner: 'Shipique Premium',
                    status: 'paid'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchShipment();
    }, [awb]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-8">Loading Invoice...</div>;
    if (!shipment) return <div className="p-8">Shipment not found</div>;

    return (
        <div className="invoice-page animate-fade-in" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            {/* Action Bar (Hidden in Print) */}
            <div className="no-print flex justify-between items-center mb-6">
                <button onClick={() => navigate(-1)} className="btn btn-outline flex items-center gap-2">
                    <ArrowLeft size={18} /> Back
                </button>
                <div className="flex gap-2">
                    <button onClick={handlePrint} className="btn btn-primary flex items-center gap-2">
                        <Printer size={18} /> Print Invoice
                    </button>
                    <button className="btn btn-accent flex items-center gap-2">
                        <Download size={18} /> Download PDF
                    </button>
                </div>
            </div>

            {/* Invoice Container */}
            <div className="card invoice-container" style={{
                padding: '3rem',
                background: '#fff',
                color: '#1a1a1a',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
            }}>
                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-12 border-b pb-8">
                    <div>
                        <h1 style={{ color: 'var(--primary)', fontSize: '2.5rem', margin: 0, fontWeight: 800 }}>Shipique</h1>
                        <p className="text-muted" style={{ marginTop: '0.5rem' }}>Your Parcel's Pathfinder</p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                            <Globe size={14} /> www.shipique.com
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ margin: 0, color: '#374151' }}>INVOICE</h2>
                        <p style={{ fontWeight: 600, color: 'var(--accent)' }}>#{shipment.local_awb}</p>
                        <div className="mt-4">
                            <p className="text-sm text-gray-400 m-0">Date Issued</p>
                            <p className="font-semibold m-0">{new Date(shipment.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                        </div>
                    </div>
                </div>

                {/* Addresses Section */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-bold">FROM (SENDER)</h4>
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                            <p className="font-bold text-lg mb-1">{shipment.sender_name}</p>
                            <p className="text-gray-600 mb-2">{shipment.sender_address}</p>
                            <p className="text-sm font-medium text-gray-500"><MapPin size={12} className="inline mr-1" /> {shipment.sender_phone}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-bold">TO (RECEIVER)</h4>
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                            <p className="font-bold text-lg mb-1">{shipment.receiver_name}</p>
                            <p className="text-gray-600 mb-2">{shipment.receiver_address}</p>
                            <p className="text-sm font-medium text-gray-500"><MapPin size={12} className="inline mr-1" /> {shipment.receiver_phone}</p>
                        </div>
                    </div>
                </div>

                {/* Shipment Details Table */}
                <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                            <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Description</th>
                            <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 600 }}>Weight</th>
                            <th style={{ textAlign: 'center', padding: '1rem', fontWeight: 600 }}>Courier</th>
                            <th style={{ textAlign: 'right', padding: '1rem', fontWeight: 600 }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '1.5rem 1rem' }}>
                                <div className="flex items-center gap-3">
                                    <div style={{ background: 'var(--primary-bg)', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <span style={{ fontWeight: 600, display: 'block' }}>Standard Shipment Service</span>
                                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Tracking ID: {shipment.local_awb}</span>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>{shipment.weight} kg</td>
                            <td style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
                                <span className="badge badge-info">{shipment.courier_owner}</span>
                            </td>
                            <td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 700 }}>₹{shipment.price}.00</td>
                        </tr>
                    </tbody>
                </table>

                {/* Totals Section */}
                <div className="flex justify-end mt-8">
                    <div style={{ width: '300px' }}>
                        <div className="flex justify-between py-2 text-gray-500">
                            <span>Subtotal</span>
                            <span>₹{shipment.price}.00</span>
                        </div>
                        <div className="flex justify-between py-2 text-gray-500">
                            <span>Taxes (18% GST)</span>
                            <span>₹0.00 (Incl.)</span>
                        </div>
                        <div className="flex justify-between py-4 border-t border-b my-2" style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                            <span style={{ color: 'var(--primary)' }}>Grand Total</span>
                            <span style={{ color: 'var(--primary)' }}>₹{shipment.price}.00</span>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-green-600 font-bold bg-green-50 p-2 rounded justify-center">
                            <CreditCard size={16} /> Fully Paid
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #f3f4f6' }}>
                    <h4 className="font-bold mb-2">Terms & Conditions</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        This is a computer-generated invoice and doesn't require any signature.
                        The shipment is subject to the terms of carriage of Shipique.
                        For any support, please contact us at support@shipique.com.
                    </p>
                </div>
            </div>

            {/* Print Specific CSS */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body { background: white !important; padding: 0 !important; }
                    .no-print { display: none !important; }
                    .invoice-page { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
                    .invoice-container { box-shadow: none !important; border: none !important; padding: 0 !important; }
                    .card { box-shadow: none !important; border: none !important; }
                }
            ` }} />
        </div>
    );
};

export default Invoice;
