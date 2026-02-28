import React, { useState, useEffect } from 'react';
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
import { ChevronLeft, ChevronRight, MapPin, Trophy, ExternalLink, X, Info, Video, CalendarPlus } from 'lucide-react';
import tournamentData from './tournaments.json';

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { sources, tournaments } = tournamentData;
  const [selectedEvent, setSelectedEvent] = useState(null);

  const downloadIcs = (event) => {
    const start = parseISO(event.start_date);
    const end = addDays(parseISO(event.end_date), 1);
    
    const formatDate = (date) => format(date, "yyyyMMdd");
    const now = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Padel Calendar//DA',
      'BEGIN:VEVENT',
      `UID:${event.id}-${event.start_date}@padelcalendar.dk`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${formatDate(start)}`,
      `DTEND;VALUE=DATE:${formatDate(end)}`,
      `SUMMARY:${event.name}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.name.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllIcs = () => {
    const activeEvents = tournaments.filter(t => activeCategories.includes(t.category));
    if (activeEvents.length === 0) return alert("Vælg mindst én kategori for at eksportere.");

    const now = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");
    const formatDate = (date) => format(date, "yyyyMMdd");

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Padel Calendar//DA',
      'X-WR-CALNAME:Padel Kalender 2026',
      'X-WR-TIMEZONE:Europe/Copenhagen'
    ];

    activeEvents.forEach(event => {
      const start = parseISO(event.start_date);
      const end = addDays(parseISO(event.end_date), 1);
      
      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${event.id}-${event.start_date}@padelcalendar.dk`);
      icsContent.push(`DTSTAMP:${now}`);
      icsContent.push(`DTSTART;VALUE=DATE:${formatDate(start)}`);
      icsContent.push(`DTEND;VALUE=DATE:${formatDate(end)}`);
      icsContent.push(`SUMMARY:${event.name}`);
      icsContent.push(`DESCRIPTION:${event.description || ''}`);
      icsContent.push(`LOCATION:${event.location}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Padel_Kalender_2026.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Kategorier og deres farver
  const categories = [
    { id: 'Major', color: 'bg-red-500' },
    { id: 'P1', color: 'bg-blue-500' },
    { id: 'P2', color: 'bg-green-500' },
    { id: 'DPF1000', color: 'bg-red-600' },
    { id: 'Special', color: 'bg-orange-600' },
    { id: 'Lunar Ligaen', color: 'bg-indigo-700' },
    { id: 'FIP - DK', color: 'bg-sky-500' },
    { id: 'Finals', color: 'bg-purple-600' },
    { id: 'Andre', color: 'bg-gray-400' }
  ];

  // Hent aktive kategorier fra LocalStorage eller brug alle som default
  const [activeCategories, setActiveCategories] = useState(() => {
    const saved = localStorage.getItem('padel_active_categories');
    return saved ? JSON.parse(saved) : categories.map(c => c.id);
  });

  // Gem i LocalStorage når valg ændres
  useEffect(() => {
    localStorage.setItem('padel_active_categories', JSON.stringify(activeCategories));
  }, [activeCategories]);

  const toggleCategory = (categoryId) => {
    setActiveCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const closeModal = () => setSelectedEvent(null);

  const renderHeader = () => (
    <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 bg-gray-800 rounded-t-xl border-b border-gray-700">
      <div className="flex items-center gap-2 md:gap-4">
        <Trophy className="text-yellow-500 w-6 h-6 md:w-8 md:h-8 flex-shrink-0" />
        <h1 className="text-xl md:text-3xl font-bold tracking-tight text-white uppercase truncate">
          {format(currentDate, 'MMMM yyyy', { locale: da })}
        </h1>
      </div>
      <div className="flex gap-1 md:gap-3">
        <button 
          onClick={downloadAllIcs}
          className="hidden md:flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg text-xs font-bold transition-all border border-blue-500/30 mr-2"
          title="Eksporter aktive kategorier"
        >
          <CalendarPlus size={16} /> Eksporter alle
        </button>
        <button onClick={prevMonth} className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white">
          <ChevronLeft size={24} className="md:w-7 md:h-7" />
        </button>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white">
          <ChevronRight size={24} className="md:w-7 md:h-7" />
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];
    const fullDays = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
    return (
      <div className="grid grid-cols-7 bg-gray-800/50 border-b border-gray-700">
        {fullDays.map((day, idx) => (
          <div key={day} className="py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-widest">
            <span className="hidden md:inline">{day}</span>
            <span className="inline md:hidden">{days[idx]}</span>
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
        const formattedDate = format(day, "d");
        
        const dayTournaments = tournaments.filter((t) => {
          const start = parseISO(t.start_date);
          const end = parseISO(t.end_date);
          // Filtrer på både dato OG om kategorien er aktiv
          return day >= start && day <= end && activeCategories.includes(t.category);
        });

        days.push(
          <div
            key={day}
            className={`min-h-[120px] p-1 md:p-2 border-r border-b border-gray-800 transition-colors relative  ${
              !isSameMonth(day, monthStart)
                ? "bg-gray-900/40 text-gray-600"
                : "bg-gray-800/20 text-gray-300"
            }`}
          >
            <span
              className={`text-[10px] md:text-sm font-medium ${isSameDay(day, new Date()) ? "bg-blue-600 px-1.5 py-0.5 rounded text-white" : ""}`}
            >
              {formattedDate}
            </span>
            <div className="mt-1 space-y-0.5 md:space-y-1">
              {dayTournaments.map((t, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedEvent(t)}
                  className={`p-1 md:p-1.5 rounded cursor-pointer hover:brightness-125 transition-all border-l-2 md:border-l-4 ${
                    t.category === "Major"
                      ? "bg-red-900/40 border-red-500 text-red-200"
                      : t.category === "P1"
                        ? "bg-blue-900/40 border-blue-500 text-blue-200"
                        : t.category === "P2"
                          ? "bg-green-900/40 border-green-500 text-green-200"
                          : t.category === "DPF1000"
                            ? "bg-red-600 border-white text-white"
                            : t.category === "Special"
                              ? "bg-orange-600/60 border-orange-400 text-white shadow-sm"
                              : t.category === "Lunar Ligaen"
                                ? "bg-indigo-700 border-indigo-300 text-white font-bold"
                                : t.category === "FIP - DK"
                                  ? "bg-sky-600 border-sky-200 text-white font-bold shadow-sm animate-pulse"
                                  : t.category === "Finals"
                                  ? "bg-purple-900/40 border-purple-500 text-purple-200"
                                  : "bg-gray-700/40 border-gray-400 text-gray-200"
                  }`}
                >
                  <div className="text-[8px] md:text-[10px] font-bold md:leading-tight">
                    {t.name}
                  </div>
                </div>
              ))}
            </div>
          </div>,
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>,
      );
      days = [];
    }
    return <div className="bg-gray-800/10">{rows}</div>;
  };

  const Modal = () => {
    if (!selectedEvent) return null;

    const resolvedLinks = (selectedEvent.streaming_link_ids || [])
      .map(id => sources[id])
      .filter(Boolean);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={closeModal}
      >
        <div
          className="bg-gray-800 w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`h-2 ${
              selectedEvent.category === "Major"
                ? "bg-red-500"
                : selectedEvent.category === "P1"
                  ? "bg-blue-500"
                  : selectedEvent.category === "P2"
                    ? "bg-green-500"
                    : selectedEvent.category === "DPF1000"
                      ? "bg-red-600"
                      : selectedEvent.category === "Special"
                        ? "bg-orange-500"
                        : selectedEvent.category === "Lunar Ligaen"
                          ? "bg-indigo-500"
                          : selectedEvent.category === "Finals"
                            ? "bg-purple-500"
                            : "bg-gray-500"
            }`}
          />

          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="pr-8">
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 block">
                  {selectedEvent.category}
                </span>
                <h2 className="text-xl md:text-3xl font-black text-white leading-tight">
                  {selectedEvent.name}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-700 rounded-full text-gray-400 transition-colors flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start gap-3 text-gray-300">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-700 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <MapPin size={18} className="md:w-5 md:h-5" />
                </div>
                <div className="pt-0.5">
                  <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">
                    Lokation
                  </p>
                  <p className="text-sm md:text-base font-medium">
                    {selectedEvent.location}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-300">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-700 flex items-center justify-center text-green-400 flex-shrink-0">
                  <Info size={18} className="md:w-5 md:h-5" />
                </div>
                <div className="pt-0.5">
                  <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">
                    Beskrivelse
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                    {selectedEvent.description ||
                      "Ingen beskrivelse tilgængelig."}
                  </p>
                </div>
              </div>

                <div className="pt-4 border-t border-gray-700">
                  <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase mb-3 flex items-center gap-2">
                    <CalendarPlus size={14} /> Kalender
                  </p>
                  <button 
                    onClick={() => downloadIcs(selectedEvent)}
                    className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg"
                  >
                    Tilføj til min kalender (.ics)
                  </button>
                </div>

              {resolvedLinks.length > 0 && (
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase mb-3 flex items-center gap-2">
                    <Video size={14} /> Streaming & Links
                  </p>
                  <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-3">
                    {resolvedLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-bold transition-all border border-gray-600"
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
    <div className="w-full max-w-6xl mx-auto py-4 md:py-12 px-2 md:px-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
      
      {/* Interaktiv Legende */}
      <div className="mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-4 justify-center p-2">
        {categories.map(cat => {
          const isActive = activeCategories.includes(cat.id);
          return (
            <button 
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all border ${
                isActive 
                  ? 'bg-gray-800 border-gray-600 text-gray-200 opacity-100 shadow-sm' 
                  : 'bg-gray-900 border-transparent text-gray-600 opacity-50 grayscale'
              }`}
            >
              <span className={`w-2.5 h-2.5 ${cat.color} rounded-sm`}></span>
              <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider">{cat.id}</span>
            </button>
          );
        })}
      </div>
      <Modal />
    </div>
  );
};

export default App;
