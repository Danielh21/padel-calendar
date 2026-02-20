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
  const { sources, tournaments } = tournamentData;
  const [selectedEvent, setSelectedEvent] = useState(null);

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
          return day >= start && day <= end;
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

    // Resolve streaming links from IDs
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
      <div className="mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-4 justify-center text-[10px] md:text-xs p-2">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-sm"></span> Major</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span> P1</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-green-500 rounded-sm"></span> P2</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-600 rounded-sm"></span> DPF1000</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-orange-600 rounded-sm"></span> Special</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-700 rounded-sm"></span> Lunar Ligaen</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-gray-400 rounded-sm"></span> Andre</div>
      </div>
      <Modal />
    </div>
  );
};

export default App;
