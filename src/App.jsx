import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  parseISO 
} from 'date-fns';
import { da } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, MapPin, Trophy, ExternalLink, X, Info, Video } from 'lucide-react';
import tournamentData from './tournaments.json';

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tournaments] = useState(tournamentData);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const closeModal = () => setSelectedEvent(null);

  const renderHeader = () => (
    <div className="flex items-center justify-between px-8 py-6 bg-gray-800 rounded-t-xl border-b border-gray-700 ">
      <div className="flex items-center gap-4">
        <Trophy className="text-yellow-500 w-8 h-8" />
        <h1 className="text-3xl font-bold tracking-tight text-white uppercase">
          {format(currentDate, "MMMM yyyy", { locale: da })}
        </h1>
      </div>
      <div className="flex gap-3">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
    return (
      <div className="grid grid-cols-7 bg-gray-800/50 border-b border-gray-700">
        {days.map((day) => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        
        const dayTournaments = tournaments.filter(t => {
          const start = parseISO(t.start_date);
          const end = parseISO(t.end_date);
          return day >= start && day <= end;
        });

        days.push(
          <div
            key={day}
            className={`min-h-[120px] p-2 border-r border-b border-gray-800 transition-colors ${
              !isSameMonth(day, monthStart) ? 'bg-gray-900/40 text-gray-600' : 'bg-gray-800/20'
            }`}
          >
            <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'bg-blue-600 px-2 py-1 rounded text-white' : ''}`}>
              {formattedDate}
            </span>
            <div className="mt-2 space-y-1">
              {dayTournaments.map((t, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedEvent(t)}
                  className={`text-[10px] p-1.5 rounded leading-tight border-l-4 cursor-pointer hover:brightness-125 transition-all ${
                    t.category === 'Major' ? 'bg-red-900/40 border-red-500 text-red-200' :
                    t.category === 'P1' ? 'bg-blue-900/40 border-blue-500 text-blue-200' :
                    t.category === 'P2' ? 'bg-green-900/40 border-green-500 text-green-200' :
                    t.category === 'DPF1000' ? 'bg-red-600 border-white text-white font-bold shadow-sm' :
                    t.category === 'Special' ? 'bg-orange-600/60 border-orange-400 text-white font-bold italic shadow-md' :
                    'bg-gray-700/40 border-gray-400 text-gray-200'
                  }`}
                >
                  <div className="font-bold truncate">{t.name}</div>
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="bg-gray-800/10">{rows}</div>;
  };

  const Modal = () => {
    if (!selectedEvent) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closeModal}>
        <div className="bg-gray-800 w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className={`h-2 ${
            selectedEvent.category === 'Major' ? 'bg-red-500' :
            selectedEvent.category === 'P1' ? 'bg-blue-500' :
            selectedEvent.category === 'P2' ? 'bg-green-500' :
            selectedEvent.category === 'DPF1000' ? 'bg-red-600' :
            selectedEvent.category === 'Special' ? 'bg-orange-500' :
            'bg-gray-500'
          }`} />
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">{selectedEvent.category}</span>
                <h2 className="text-3xl font-black text-white leading-none">{selectedEvent.name}</h2>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-700 rounded-full text-gray-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-3 text-gray-300">
                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="pt-0.5">
                  <p className="text-xs text-gray-500 font-bold uppercase">Lokation</p>
                  <p className="font-medium">{selectedEvent.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-300">
                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-green-400 flex-shrink-0">
                  <Info size={20} />
                </div>
                <div className="pt-0.5">
                  <p className="text-xs text-gray-500 font-bold uppercase">Beskrivelse</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{selectedEvent.description || "Ingen beskrivelse tilgængelig."}</p>
                </div>
              </div>

              {selectedEvent.streaming_links && selectedEvent.streaming_links.length > 0 && (
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-4 flex items-center gap-2">
                    <Video size={14} /> Streaming & Links
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {selectedEvent.streaming_links.map((link, i) => (
                      <a 
                        key={i} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-bold transition-all border border-gray-600"
                      >
                        {link.label} <ExternalLink size={14} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Major</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-sm"></span> P1</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> P2</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-600 rounded-sm"></span> DPF1000</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-600 rounded-sm"></span> Special</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-400 rounded-sm"></span> Andre</div>
      </div>
      <Modal />
    </div>
  );
};

export default App;
