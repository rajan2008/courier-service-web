import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { MapPin, Package, User, Phone, Navigation, Info, ShoppingBag, Truck, Check } from 'lucide-react';
import axios from 'axios';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '20px' };
const center = { lat: 20.5937, lng: 78.9629 }; // Center of India

// Mock Pincode Database for Gujarat (Demo fallback)
const PIN_DB = {
    "380001": { city: "Ahmedabad", state: "Gujarat" },
    "380015": { city: "Ahmedabad", state: "Gujarat" },
    "395001": { city: "Surat", state: "Gujarat" },
    "390001": { city: "Vadodara", state: "Gujarat" },
    "390006": { city: "Vadodara", state: "Gujarat" },
    "390011": { city: "Vadodara", state: "Gujarat" },
    "390019": { city: "Vadodara", state: "Gujarat" },
    "390022": { city: "Vadodara", state: "Gujarat" },
    "390007": { city: "Vadodara", state: "Gujarat" },
    "390010": { city: "Vadodara", state: "Gujarat" },
    "390020": { city: "Vadodara", state: "Gujarat" },
    "391110": { city: "Vadodara", state: "Gujarat" },
    "360001": { city: "Rajkot", state: "Gujarat" },
    "362001": { city: "Junagadh", state: "Gujarat" },
    "382010": { city: "Gandhinagar", state: "Gujarat" },
    "110001": { city: "Delhi", state: "Delhi" },
    "400001": { city: "Mumbai", state: "Maharashtra" },
    "560001": { city: "Bangalore", state: "Karnataka" }
};

const BookShipment = () => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: "AIzaSyBvI-_2IkyeOtczrxmb7sSpE0h2aKBHOHg",
        libraries,
    });

    const [form, setForm] = useState({
        sender_name: '', sender_phone: '', sender_address: '', sender_city: '', sender_state: '', pickup_pincode: '',
        receiver_name: '', receiver_phone: '', receiver_address: '', receiver_city: '', receiver_state: '', delivery_pincode: '',
        weight: '', price: '', partner_awb: '', courier_owner: ''
    });

    const [marker, setMarker] = useState(center);
    const [pricingOptions, setPricingOptions] = useState([]);
    const [isBooking, setIsBooking] = useState(false);

    // Unified Address Resolver
    const resolveAddress = (searchQuery, targetPrefix, isPinToCity) => {
        if (isPinToCity && /^\d{6}$/.test(searchQuery.split(',')[0])) {
            const pin = searchQuery.split(',')[0];
            fetch(`https://api.postalpincode.in/pincode/${pin}`)
                .then(res => res.json())
                .then(data => {
                    if (data[0] && data[0].Status === "Success" && data[0].PostOffice) {
                        const po = data[0].PostOffice[0];
                        const area = po.Name;
                        const city = po.District;
                        const state = po.State;
                        const formattedCity = area && area !== city ? `${city} (${area})` : city;
                        setForm(prev => ({
                            ...prev,
                            [`${targetPrefix}_city`]: formattedCity,
                            [`${targetPrefix}_state`]: state
                        }));
                        console.log("✅ Resolved via India Post API");
                    } else {
                        googleResolver(searchQuery, targetPrefix, isPinToCity);
                    }
                })
                .catch(() => googleResolver(searchQuery, targetPrefix, isPinToCity));
        } else {
            googleResolver(searchQuery, targetPrefix, isPinToCity);
        }
    };

    const googleResolver = (searchQuery, targetPrefix, isPinToCity) => {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=AIzaSyBvI-_2IkyeOtczrxmb7sSpE0h2aKBHOHg`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                console.log("🌎 Geocoding Response:", data);
                if (data.results && data.results.length > 0) {
                    const comps = data.results[0].address_components;

                    const pin = comps.find(c => c.types.includes('postal_code'))?.long_name || '';
                    const state = comps.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';

                    const locality = comps.find(c => c.types.includes('locality'))?.long_name;
                    const district = comps.find(c => c.types.includes('administrative_area_level_2'))?.long_name;
                    const area = comps.find(c => c.types.includes('sublocality_level_1'))?.long_name ||
                        comps.find(c => c.types.includes('neighborhood'))?.long_name || '';

                    const mainCity = locality || district || '';
                    const city = area ? `${mainCity} (${area})` : mainCity;

                    const cityKey = `${targetPrefix}_city`;
                    const stateKey = `${targetPrefix}_state`;
                    const pinKey = targetPrefix === 'sender' ? 'pickup_pincode' : 'delivery_pincode';

                    setForm(prev => {
                        const newForm = { ...prev };
                        if (isPinToCity) {
                            if (city) newForm[cityKey] = city;
                            if (state) newForm[stateKey] = state;
                        } else {
                            if (pin) newForm[pinKey] = pin;
                            if (state) newForm[stateKey] = state;
                        }
                        return newForm;
                    });
                }
            })
            .catch(err => console.error("Geocoding service error:", err));
    };

    // Auto-identify City from Pincode
    const handlePincodeChange = (e, targetPrefix) => {
        const pin = e.target.value;
        const pinKey = targetPrefix === 'sender' ? 'pickup_pincode' : 'delivery_pincode';
        setForm(prev => ({ ...prev, [pinKey]: pin }));

        if (pin.length === 6 && /^\d+$/.test(pin)) {
            // Instant check for local DB
            if (PIN_DB[pin]) {
                setForm(prev => ({
                    ...prev,
                    [`${targetPrefix}_city`]: PIN_DB[pin].city,
                    [`${targetPrefix}_state`]: PIN_DB[pin].state
                }));
            } else {
                resolveAddress(`${pin}, India`, targetPrefix, true);
            }
        }
    };

    // Auto-identify Pincode from City (New Logic)
    const handleCityBlur = (targetPrefix) => {
        const city = form[`${targetPrefix}_city`];
        const state = form[`${targetPrefix}_state`];

        if (city.length > 2) {
            const query = state ? `${city}, ${state}, India` : `${city}, India`;
            resolveAddress(query, targetPrefix, false);
        }
    };

    // Address decoding from Map Click
    const onMapClick = useCallback((event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setMarker({ lat, lng });

        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBvI-_2IkyeOtczrxmb7sSpE0h2aKBHOHg`)
            .then(res => res.json())
            .then(data => {
                if (data.results[0]) {
                    const address = data.results[0].formatted_address;
                    const comps = data.results[0].address_components;
                    const pincode = comps.find(c => c.types.includes('postal_code'))?.long_name || '';
                    const city = comps.find(c => c.types.includes('locality'))?.long_name || '';
                    const state = comps.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';

                    setForm(prev => ({
                        ...prev,
                        sender_address: address,
                        pickup_pincode: pincode,
                        sender_city: city,
                        sender_state: state
                    }));
                }
            });
    }, []);

    // Pricing Fetch
    useEffect(() => {
        if (form.weight && form.pickup_pincode && form.delivery_pincode) {
            const fetchPrice = async () => {
                try {
                    const res = await axios.get(`http://localhost:5000/api/shipments/pricing?weight=${form.weight}&pickup=${form.pickup_pincode}&delivery=${form.delivery_pincode}`);
                    setPricingOptions(res.data.options);
                } catch (e) { console.error(e); }
            };
            const timer = setTimeout(fetchPrice, 500);
            return () => clearTimeout(timer);
        }
    }, [form.weight, form.pickup_pincode, form.delivery_pincode]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsBooking(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/shipments', form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('🎉 Shipment Booked Successfully!');
            setForm({
                sender_name: '', sender_phone: '', sender_address: '', sender_city: '', sender_state: '', pickup_pincode: '',
                receiver_name: '', receiver_phone: '', receiver_address: '', receiver_city: '', receiver_state: '', delivery_pincode: '',
                weight: '', price: '', partner_awb: '', courier_owner: ''
            });
            setPricingOptions([]);
        } catch (err) {
            alert('Booking failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsBooking(false);
        }
    };

    if (loadError) return <div className="p-8 text-center text-danger">Error loading maps. Please check your API key.</div>;
    if (!isLoaded) return <div className="p-8 text-center animate-pulse">Initializing Courier Map System...</div>;

    return (
        <div className="flex gap-6 animate-fade-in book-shipment-container" style={{ paddingBottom: '1rem' }}>

            {/* Premium Form Section */}
            <div className="card shadow-lg shipment-form-card" style={{ flex: '1.2', overflowY: 'auto', padding: '2rem', borderTop: '5px solid var(--accent)' }}>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="flex items-center gap-3">
                            <Navigation size={28} style={{ color: 'var(--accent)' }} />
                            New Consignment
                        </h2>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>Fill details or pin location on map for instant pickup.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-col gap-6">

                    {/* SENDER BOX */}
                    <div className="form-group-box">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <User size={18} color="var(--accent)" />
                            <h4 className="m-0">Sender Information</h4>
                        </div>
                        <div className="grid grid-2-col gap-4">
                            <div className="input-group">
                                <label>Full Name</label>
                                <input name="sender_name" value={form.sender_name} onChange={handleChange} className="input-v2" required />
                            </div>
                            <div className="input-group">
                                <label>Mobile Number</label>
                                <input name="sender_phone" value={form.sender_phone} onChange={handleChange} className="input-v2" required />
                            </div>
                        </div>
                        <div className="input-group mt-3">
                            <label>Pickup Address</label>
                            <textarea name="sender_address" value={form.sender_address} onChange={handleChange} className="input-v2" style={{ resize: 'none', height: '60px' }} required />
                        </div>
                        <div className="grid grid-3-col gap-4 mt-3">
                            <div className="input-group">
                                <label>Pincode</label>
                                <input name="pickup_pincode" value={form.pickup_pincode} onChange={(e) => handlePincodeChange(e, 'sender')} className="input-v2" placeholder="Ex: 380001" required />
                            </div>
                            <div className="input-group">
                                <label>City</label>
                                <input name="sender_city" value={form.sender_city} onChange={handleChange} onBlur={() => handleCityBlur('sender')} className="input-v2" required />
                            </div>
                            <div className="input-group">
                                <label>State</label>
                                <input name="sender_state" value={form.sender_state} onChange={handleChange} className="input-v2" required />
                            </div>
                        </div>
                    </div>

                    {/* RECEIVER BOX */}
                    <div className="form-group-box">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <ShoppingBag size={18} color="var(--primary)" />
                            <h4 className="m-0">Receiver Information</h4>
                        </div>
                        <div className="grid grid-2-col gap-4">
                            <div className="input-group">
                                <label>Receiver Name</label>
                                <input name="receiver_name" value={form.receiver_name} onChange={handleChange} className="input-v2" required />
                            </div>
                            <div className="input-group">
                                <label>Receiver Mobile</label>
                                <input name="receiver_phone" value={form.receiver_phone} onChange={handleChange} className="input-v2" required />
                            </div>
                        </div>
                        <div className="input-group mt-3">
                            <label>Delivery Address</label>
                            <textarea name="receiver_address" value={form.receiver_address} onChange={handleChange} className="input-v2" style={{ resize: 'none', height: '60px' }} required />
                        </div>
                        <div className="grid grid-3-col gap-4 mt-3">
                            <div className="input-group">
                                <label>Pincode</label>
                                <input name="delivery_pincode" value={form.delivery_pincode} onChange={(e) => handlePincodeChange(e, 'receiver')} className="input-v2" placeholder="Ex: 395001" required />
                            </div>
                            <div className="input-group">
                                <label>City</label>
                                <input name="receiver_city" value={form.receiver_city} onChange={handleChange} onBlur={() => handleCityBlur('receiver')} className="input-v2" required />
                            </div>
                            <div className="input-group">
                                <label>State</label>
                                <input name="receiver_state" value={form.receiver_state} onChange={handleChange} className="input-v2" required />
                            </div>
                        </div>
                    </div>

                    {/* PARCEL BOX */}
                    <div className="form-group-box">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <Package size={18} color="var(--accent)" />
                            <h4 className="m-0">Parcel Specifications</h4>
                        </div>
                        <div className="grid grid-2-col gap-4">
                            <div className="input-group">
                                <label>Weight (Kilograms)</label>
                                <input name="weight" type="number" step="0.1" value={form.weight} onChange={handleChange} className="input-v2" required />
                            </div>
                            {form.price && (
                                <div className="input-group">
                                    <label>Estimated Cost</label>
                                    <div className="price-display">₹{form.price}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COURIER SELECTION */}
                    {pricingOptions.length > 0 && (
                        <div className="animate-fade-in">
                            <h4 className="mb-4 flex items-center gap-2"><Truck size={18} /> Available Couriers</h4>
                            <div className="courier-grid">
                                {pricingOptions.map(opt => (
                                    <div
                                        key={opt.courier}
                                        onClick={() => setForm({ ...form, courier_owner: opt.courier, price: opt.price })}
                                        className={`courier-card ${form.courier_owner === opt.courier ? 'active' : ''}`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="courier-name">{opt.courier}</span>
                                            {form.courier_owner === opt.courier && <Check size={16} className="text-success" />}
                                        </div>
                                        <div className="courier-price">₹{opt.price}</div>
                                        <div className="courier-tag">Standard Delivery</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button disabled={isBooking} type="submit" className="btn-ship">
                        {isBooking ? 'Processing Booking...' : 'Process Consignment'}
                    </button>
                </form>
            </div>

            {/* Premium Map Section */}
            <div className="flex-col gap-4" style={{ flex: 1 }}>
                <div className="card shadow-md" style={{ flex: 1, padding: 0, overflow: 'hidden', border: 'none', position: 'relative' }}>
                    <div className="map-overlay">
                        <MapPin size={16} color="var(--accent)" />
                        <span>Precise Pickup Locator</span>
                    </div>
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        zoom={11}
                        center={marker}
                        onClick={onMapClick}
                        options={{ styles: silverMapStyle }}
                    >
                        <Marker
                            position={marker}
                            animation={window.google?.maps?.Animation?.DROP}
                        />
                    </GoogleMap>
                </div>

                <div className="card flex items-center gap-4 bg-accent-soft" style={{ background: 'rgba(217, 119, 54, 0.05)', borderLeft: '4px solid var(--accent)' }}>
                    <Info size={24} color="var(--accent)" />
                    <div>
                        <h5 className="m-0" style={{ color: 'var(--accent)' }}>Smart Identify Active</h5>
                        <p className="m-0 text-xs">Pincode and City data is automatically mapped using our verified database.</p>
                    </div>
                </div>
            </div>

            {/* Custom Interactive Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .book-shipment-container { height: calc(100vh - 120px); }
                @media (max-width: 768px) {
                    .book-shipment-container { 
                        flex-direction: column !important; 
                        height: auto !important;
                    }
                    .shipment-form-card { overflow-y: visible !important; }
                    .grid-2-col, .grid-3-col { grid-template-columns: 1fr !important; }
                    .flex-col.gap-4 { min-height: 400px; }
                }
                .form-group-box {
                    background: #fff;
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid #f0f0f0;
                    transition: border-color 0.3s;
                }
                .form-group-box:focus-within {
                    border-color: rgba(217, 119, 54, 0.3);
                }
                .grid-2-col { grid-template-columns: 1fr 1fr; }
                .grid-3-col { grid-template-columns: 1fr 1fr 1fr; }
                
                .input-group label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #9ca3af;
                    text-transform: uppercase;
                    margin-bottom: 0.25rem;
                    letter-spacing: 0.02em;
                }
                .input-v2 {
                    width: 100%;
                    padding: 0.65rem 1rem;
                    border-radius: 8px;
                    border: 1.5px solid #e5e7eb;
                    background: #fbfbfb;
                    font-family: inherit;
                    font-weight: 500;
                    transition: all 0.2s;
                    outline: none;
                }
                .input-v2:focus {
                    border-color: var(--accent);
                    background: #fff;
                    box-shadow: 0 4px 12px rgba(217, 119, 54, 0.08);
                }
                .price-display {
                    background: #fdf2f2;
                    color: #d97736;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-weight: 800;
                    font-size: 1.1rem;
                    border: 1px dashed var(--accent);
                    text-align: center;
                }
                .courier-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .courier-card {
                    padding: 1rem;
                    border-radius: 12px;
                    border: 2px solid #f3f4f6;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    background: #fff;
                }
                .courier-card:hover { border-color: #cbd5e1; transform: translateY(-3px); }
                .courier-card.active {
                    background: rgba(217, 119, 54, 0.05);
                    border-color: var(--accent);
                    box-shadow: 0 10px 15px -3px rgba(217, 119, 54, 0.1);
                }
                .courier-name { font-weight: 700; color: #374151; font-size: 0.9rem; }
                .courier-price { font-size: 1.25rem; font-weight: 800; color: var(--accent); }
                .courier-tag { font-size: 0.65rem; color: #9ca3af; text-transform: uppercase; font-weight: 700; margin-top: 4px; }
                
                .btn-ship {
                    background: linear-gradient(135deg, var(--accent) 0%, #c06328 100%);
                    color: white;
                    border: none;
                    width: 100%;
                    padding: 1.25rem;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 1.1rem;
                    cursor: pointer;
                    box-shadow: 0 10px 25px -5px rgba(217, 119, 54, 0.3);
                    transition: all 0.3s;
                }
                .btn-ship:hover { transform: translateY(-2px); box-shadow: 0 20px 25px -5px rgba(217, 119, 54, 0.4); filter: brightness(1.1); }
                .btn-ship:active { transform: translateY(0); }
                .btn-ship:disabled { grayscale(1); opacity: 0.7; cursor: not-allowed; }
                
                .map-overlay {
                    position: absolute;
                    top: 1rem;
                    left: 1rem;
                    z-index: 10;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(8px);
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    color: var(--primary);
                }
            ` }} />
        </div>
    );
};

const silverMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] }
];

export default BookShipment;
