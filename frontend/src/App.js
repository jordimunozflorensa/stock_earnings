import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios';

export default function App() {
  const [events, setEvents] = useState([]);
  const [missing, setMissing] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/earnings')
      .then(resp => {
        // La respuesta es { results: [...], faltantes: [...] }
        const { results, faltantes } = resp.data;

        // Mapear results a eventos para FullCalendar
        const ev = results.map(item => ({
          title: item.ticker,
          date: item.date    // YA debe venir en formato YYYY-MM-DD
        }));
        setEvents(ev);
        setMissing(faltantes);
      })
      .catch(err => console.error('Error al llamar API:', err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Earnings Release Calendar</h1>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
      />

      {missing.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Resultados no encontrados:</h2>
          <ul className="list-disc list-inside">
            {missing.map(ticker => (
              <li key={ticker}>{ticker}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
