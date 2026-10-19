import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Medicine } from '@/types/medical';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface SearchBarProps {
  onSelect?: (medicine: Medicine) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ onSelect, placeholder = "Search medicines...", className }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    const fetchMedicines = async () => {
      const snapshot = await getDocs(collection(db, "medicines"));
      const meds = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Medicine[];
      setMedicines(meds);
    };
    fetchMedicines();
  }, []);

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const handleSelect = (medicine: Medicine) => {
    setQuery(medicine.name);
    setShowSuggestions(false);
    onSelect?.(medicine);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="search-enhanced">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onFocus={() => setShowSuggestions(query.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-12 border-0 bg-transparent focus-visible:ring-0 h-12"
        />
      </div>

      {showSuggestions && filteredMedicines.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 medical-card bg-popover border border-border rounded-xl shadow-floating z-50 max-h-60 overflow-y-auto">
          {filteredMedicines.map((medicine) => (
            <button
              key={medicine.id}
              onClick={() => handleSelect(medicine)}
              className="w-full px-4 py-3 text-left hover:bg-accent/50 first:rounded-t-xl last:rounded-b-xl transition-colors"
            >
              <div className="font-medium text-foreground">{medicine.name}</div>
              <div className="text-sm text-muted-foreground">
                Stock: {medicine.quantity}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
