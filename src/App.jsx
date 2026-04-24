import React, { useState, useEffect } from 'react';
import { Car, Users, DollarSign, Shield, Gauge, Star, Heart } from 'lucide-react';

const API_BASE_URL = 'http://car-match-backend-dp5t.onrender.com/api';

function App() {
  const [step, setStep] = useState('quiz');
  const [preferences, setPreferences] = useState({
    budget: 10,
    familySize: 4,
    usage: 'Both',
    priority: 'Safety'
  });

  const [recommended, setRecommended] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [shortlist, setShortlist] = useState([]);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all cars on mount
  useEffect(() => {


  const fetchAllCars = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/cars`);
      const data = await res.json();
      setAllCars(data.data || []);
    } catch (err) {
      setError("Could not load cars. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

    fetchAllCars();

  }, []);
  // Updated handleQuizSubmit with better payload handling
  const handleQuizSubmit = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      budget: preferences.budget,
      familySize: preferences.familySize,
      priority: preferences.priority
    };

    console.log("📤 Sending payload from frontend:", payload);   // Check this in browser console

    try {
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',     // ← This is very important
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      console.log("📥 Response status:", response.status);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server returned ${response.status}`);
      }

      console.log("✅ Received from backend:", data);
      setRecommended(data.data || []);
      setStep('results');
    } catch (err) {
      console.error("❌ Frontend error:", err);
      setError(err.message || "Failed to get recommendations. Check backend terminal for logs.");
    } finally {
      setLoading(false);
    }
  };

  const toggleShortlist = (car) => {
    if (shortlist.find(c => c.id === car.id)) {
      setShortlist(shortlist.filter(c => c.id !== car.id));
    } else {
      setShortlist([...shortlist, car]);
    }
  };

  const addToCompare = (car) => {
    if (selectedForCompare.length < 3 && !selectedForCompare.find(c => c.id === car.id)) {
      setSelectedForCompare([...selectedForCompare, car]);
    }
  };

  const CarCard = ({ car, showActions = true }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all">
      <img src={car.image} alt={car.model} className="w-full h-48 object-cover" />
      <div className="p-5">
        <div className="flex justify-between">
          <div>
            <h3 className="font-bold text-xl">{car.make} {car.model}</h3>
            <p className="text-gray-500">₹{car.price} Lakh • {car.bodyType}</p>
          </div>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" /> {car.safetyRating}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div><div className="text-gray-500">Mileage</div><div className="font-semibold">{car.mileage} kmpl</div></div>
          <div><div className="text-gray-500">Seats</div><div className="font-semibold">{car.seating}</div></div>
          <div><div className="text-gray-500">Fuel</div><div className="font-semibold">{car.fuelType}</div></div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => toggleShortlist(car)}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 ${
              shortlist.some(c => c.id === car.id) ? 'bg-red-100 text-red-700' : 'bg-gray-100'
            }`}
          >
            <Heart className="w-5 h-5" />
            {shortlist.some(c => c.id === car.id) ? 'Saved' : 'Shortlist'}
          </button>
          <button
            onClick={() => addToCompare(car)}
            disabled={selectedForCompare.length >= 3}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50"
          >
            Compare
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-bold text-2xl">CarMatch</h1>
          </div>

          <div className="flex gap-6 text-sm">
            <button onClick={() => setStep('quiz')} className={step === 'quiz' ? 'text-blue-600 font-bold' : ''}>Quiz</button>
            <button onClick={() => setStep('browse')} className={step === 'browse' ? 'text-blue-600 font-bold' : ''}>Browse All</button>
            {shortlist.length > 0 && <button onClick={() => setStep('results')}>Shortlist ({shortlist.length})</button>}
            {selectedForCompare.length > 0 && <button onClick={() => setStep('compare')} className="text-blue-600">Compare ({selectedForCompare.length})</button>}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-xl mb-6">{error}</div>}

        {/* Quiz Step */}
        {step === 'quiz' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow p-10">
            <h2 className="text-3xl font-semibold text-center mb-8">Tell us what you need</h2>

            {/* Budget, Family Size, Usage, Priority fields - same as before */}
            <div className="space-y-8">
              {/* Budget Slider */}
              <div>
                <label className="flex items-center gap-2 mb-3 font-medium"><DollarSign className="w-5 h-5" /> Max Budget (₹ Lakhs)</label>
                <input
                  type="range" min="5" max="50" step="1"
                  value={preferences.budget}
                  onChange={(e) => setPreferences({ ...preferences, budget: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
                <div className="text-right text-2xl font-semibold">₹{preferences.budget} Lakh</div>
              </div>

             {/* Family Size */}
              <div>
                <label className="flex items-center gap-2 mb-3 font-medium">
                  <Users className="w-5 h-5" /> Family Size
                </label>
                <div className="flex gap-3">
                  {[2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => setPreferences({ ...preferences, familySize: n })}
                      className={`flex-1 py-4 rounded-2xl border-2 font-medium ${
                        preferences.familySize === n
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {n} People
                    </button>
                  ))}
                </div>
              </div>

              {/* Usage */}
              <div>
                <label className="block mb-3 font-medium">Primary Usage</label>
                <div className="grid grid-cols-3 gap-4">
                  {['City', 'Highway', 'Both'].map((u) => (
                    <button
                      key={u}
                      onClick={() => setPreferences({ ...preferences, usage: u })}
                      className={`py-4 rounded-2xl border-2 font-medium ${
                        preferences.usage === u
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block mb-3 font-medium">What matters most to you?</label>
                <div className="grid grid-cols-2 gap-4">
                  {['Safety', 'Mileage', 'Features', 'Space'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPreferences({ ...preferences, priority: p })}
                      className={`py-5 rounded-2xl border-2 font-medium ${
                        preferences.priority === p
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleQuizSubmit}
              disabled={loading}
              className="mt-10 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-5 rounded-2xl text-xl font-semibold"
            >
              {loading ? "Finding best cars..." : "Find My Perfect Cars →"}
            </button>
          </div>
        )}

       {/* Results Step */}
        {step === 'results' && (
          <>
            <div className="mb-10">
              <h2 className="text-4xl font-semibold mb-2">Your Recommended Cars</h2>
              <p className="text-gray-600">Based on your budget, family size, and priorities</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommended.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {shortlist.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-semibold mb-6">Your Shortlist ({shortlist.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {shortlist.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Browse All */}
        {step === 'browse' && (
          <div>
            <h2 className="text-3xl font-semibold mb-8">All Available Cars</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          </div>
        )}

        {/* Compare Step */}
        {step === 'compare' && selectedForCompare.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-semibold">Side-by-Side Comparison</h2>
              <button
                onClick={() => setSelectedForCompare([])}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-2xl shadow border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-6 text-left font-medium">Feature</th>
                    {selectedForCompare.map((car) => (
                      <th key={car.id} className="p-6 text-center border-l">
                        <div className="font-bold">{car.make} {car.model}</div>
                        <div className="text-sm text-gray-500">₹{car.price} Lakh</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Safety Rating", value: (car) => `${car.safetyRating}/5` },
                    { label: "Mileage", value: (car) => `${car.mileage} kmpl` },
                    { label: "Seating Capacity", value: (car) => `${car.seating} Seats` },
                    { label: "Fuel Type", value: (car) => car.fuelType },
                    { label: "Body Type", value: (car) => car.bodyType },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b last:border-none">
                      <td className="p-6 font-medium">{row.label}</td>
                      {selectedForCompare.map((car) => (
                        <td key={car.id} className="p-6 text-center border-l">
                          {row.value(car)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
