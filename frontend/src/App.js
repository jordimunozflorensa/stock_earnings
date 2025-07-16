import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios';

export default function App() {
  const [events, setEvents] = useState([]);
  const [earnings, setEarnings] = useState([]); // <-- New state
  const [missingEarnings, setMissingEarnings] = useState([]);
  const [dividends, setDividends] = useState([]);
  const [missingDividends, setMissingDividends] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const earningsResp = await axios.get('http://localhost:5000/api/earnings');
        const { results: earningsResults, faltantes: faltantesEarnings } = earningsResp.data;

        const earningsEvents = earningsResults.map(item => ({
          title: `${item.ticker}`,
          date: item.date
        }));

        setEarnings(earningsResults); // <-- Save full earnings data
        setMissingEarnings(faltantesEarnings);

        const dividendsResp = await axios.get('http://localhost:5000/api/dividends');
        const { results: dividendResults, faltantes: faltantesDividends } = dividendsResp.data;

        const exDividendEvents = dividendResults
          .filter(item => item.ex_date)
          .map(item => ({
            title: `${item.ticker}`,
            date: item.ex_date,
            color: 'green'
          }));

        setDividends(dividendResults);
        setMissingDividends(faltantesDividends);

        setEvents([...earningsEvents, ...exDividendEvents]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Earnings & Dividends Calendar</h1>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
      />

      {missingEarnings.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Tickers sin fecha de resultados:</h2>
          <ul className="list-disc list-inside">
            {missingEarnings.map(ticker => <li key={ticker}>{ticker}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Dividend Information</h2>
        <table className="table-auto border-collapse border border-gray-400 w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-4 py-2">Ticker</th>
              <th className="border border-gray-400 px-4 py-2">Ex-Dividend Date</th>
              <th className="border border-gray-400 px-4 py-2">Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {dividends.map(item => (
              <tr key={item.ticker}>
                <td className="border border-gray-400 px-4 py-2">{item.ticker}</td>
                <td className="border border-gray-400 px-4 py-2">{item.ex_date || '—'}</td>
                <td className="border border-gray-400 px-4 py-2">{item.pay_date || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {missingDividends.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Tickers sin información de dividendos:</h2>
          <ul className="list-disc list-inside">
            {missingDividends.map(ticker => <li key={ticker}>{ticker}</li>)}
          </ul>
        </div>
      )}

      {/* Earnings Table */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Earnings Information</h2>
        <table className="table-auto border-collapse border border-gray-400 w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-4 py-2">Ticker</th>
              <th className="border border-gray-400 px-4 py-2">Earnings Date</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map(item => (
              <tr key={item.ticker}>
                <td className="border border-gray-400 px-4 py-2">{item.ticker}</td>
                <td className="border border-gray-400 px-4 py-2">{item.date || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
