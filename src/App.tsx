import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, User, DoorOpen, LayoutGrid, 
  CheckCircle, Edit3, Palette, Clock, 
  Save, Maximize, Minimize, Eraser, Type
} from 'lucide-react';

const App = () => {
  // --- 狀態定義 ---
  const [date, setDate] = useState('2026-03-31');
  const [grade, setGrade] = useState('七年級');
  const [bgColor, setBgColor] = useState('#EAE7E0');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [doorPosition, setDoorPosition] = useState('left');
  const [gridSize, setGridSize] = useState('6x5');
  const [saveStatus, setSaveStatus] = useState(''); // 用於顯示儲存成功訊息
  
  const containerRef = useRef<HTMLDivElement>(null);

  // 時程表初始資料
  const initialSchedule = [
    { id: 1, period: '1', time: '08:25~09:10', subject: '自主學習', isBubble: false, bubbleCode: '', active: false, isBreak: false },
    { id: 2, period: '2', time: '09:20~10:05', subject: '英語', isBubble: false, bubbleCode: '', active: false, isBreak: false },
    { id: 3, period: '3', time: '10:20~11:05', subject: '自主學習', isBubble: false, bubbleCode: '', active: false, isBreak: false },
    { id: 4, period: '4', time: '11:15~12:00', subject: '社會', isBubble: true, bubbleCode: '04', active: true, isBreak: false },
    { id: 'break', period: '午休', time: '---', subject: '休息時段', isBubble: false, bubbleCode: '', active: false, isBreak: true },
    { id: 5, period: '5', time: '13:20~14:05', subject: '作文', isBubble: false, bubbleCode: '', active: false, isBreak: false },
    { id: 6, period: '6', time: '14:15~15:00', subject: '自主學習', isBubble: false, bubbleCode: '', active: false, isBreak: false },
    { id: 7, period: '7', time: '15:10~15:55', subject: '生物', isBubble: true, bubbleCode: '07', active: true, isBreak: false },
  ];

  const [schedule, setSchedule] = useState(initialSchedule);

  // 座位表初始資料
  const getInitialSeats = (size: string) => {
    const count = size === '6x6' ? 36 : 30;
    return Array.from({ length: count }, (_, i) => {
      if ([14, 15, 22].includes(i)) return '';
      return (i + 1).toString();
    });
  };

  const [seats, setSeats] = useState(getInitialSeats('6x5'));

  const [attendance, setAttendance] = useState({
    expected: '28',
    present: '26',
    absent: '2',
    notes: '3病假、22特殊試場'
  });

  const [reminders, setReminders] = useState(
    "1.劃卡請使用「2B鉛筆」，基本資料(年級、班級、座號)務必劃記正確。\n2.如果考卷很難，不要懷疑...一定是因為你太優秀了，考卷想考驗你！"
  );
  const [fontSize, setFontSize] = useState(24);
  const [seatHeight, setSeatHeight] = useState(100);

  // --- 資料持久化 (LocalStorage) ---

  // 組件載入時讀取存檔
  useEffect(() => {
    const savedData = localStorage.getItem('fxjh_exam_config');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.date) setDate(parsed.date);
        if (parsed.grade) setGrade(parsed.grade);
        if (parsed.bgColor) setBgColor(parsed.bgColor);
        if (parsed.doorPosition) setDoorPosition(parsed.doorPosition);
        if (parsed.gridSize) setGridSize(parsed.gridSize);
        if (parsed.schedule) setSchedule(parsed.schedule);
        if (parsed.seats) setSeats(parsed.seats);
        if (parsed.attendance) setAttendance(parsed.attendance);
        if (parsed.reminders) setReminders(parsed.reminders);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (parsed.seatHeight) setSeatHeight(parsed.seatHeight);
      } catch (e) {
        console.error("讀取存檔失敗", e);
      }
    }
  }, []);

  // 儲存功能
  const handleSave = () => {
    const dataToSave = {
      date, grade, bgColor, doorPosition, gridSize, 
      schedule, seats, attendance, reminders, fontSize, seatHeight
    };
    localStorage.setItem('fxjh_exam_config', JSON.stringify(dataToSave));
    
    // 顯示成功提示
    setSaveStatus('已儲存成功！');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // --- 其他功能邏輯 ---

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const totalSeats = gridSize === '6x6' ? 36 : 30;
    if (seats.length !== totalSeats) {
      setSeats(prev => {
        const newSeats = Array(totalSeats).fill('');
        for (let i = 0; i < Math.min(prev.length, totalSeats); i++) {
          newSeats[i] = prev[i];
        }
        return newSeats;
      });
    }
  }, [gridSize]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(() => {
            setIsPseudoFullscreen(true);
            setIsFullscreen(true);
          });
      } else {
        setIsPseudoFullscreen(true);
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      setIsPseudoFullscreen(false);
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPseudoFullscreen) {
        setIsPseudoFullscreen(false);
        setIsFullscreen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPseudoFullscreen]);

  const updateSchedule = (id: string | number, field: string, value: any) => {
    setSchedule(schedule.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const updateSeat = (index: number, value: string) => {
    const newSeats = [...seats];
    newSeats[index] = value;
    setSeats(newSeats);
  };

  const clearSeats = () => setSeats(Array(gridSize === '6x6' ? 36 : 30).fill(''));
  const autoFillSeats = () => setSeats(Array.from({ length: gridSize === '6x6' ? 36 : 30 }, (_, i) => (i + 1).toString()));

  const subjects = ['自主學習', '國文', '英語', '數學', '社會', '自然', '生物', '理化', '地科', '作文', '閱讀', '空白'];

  const formattedTime = currentTime.toLocaleTimeString('zh-TW', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  const isCurrentTimeInPeriod = (timeStr: string, now: Date) => {
    if (!timeStr?.includes('~')) return false;
    const [start, end] = timeStr.split('~').map(t => t.trim());
    const currentStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentStr >= start && currentStr <= end;
  };

  return (
    <div 
      ref={containerRef}
      className={`text-[#5C5652] font-sans flex flex-col p-4 md:p-6 transition-colors duration-300 ${
        isPseudoFullscreen 
          ? 'fixed inset-0 z-[9999] w-full h-full overflow-y-auto' 
          : isFullscreen 
            ? 'w-full h-screen overflow-y-auto' 
            : 'min-h-screen relative'
      }`}
      style={{ backgroundColor: bgColor }}
    >
      {/* 頂部導覽列 */}
      <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-6">
        <div className="flex flex-wrap items-center justify-center xl:justify-start gap-4 w-full xl:w-auto">
          <h1 className="text-3xl font-bold tracking-wider text-[#5C5652]">鳳翔國中<span className="text-[#8C9C92]">段考時程座位表</span></h1>
          
          <div className="flex items-center bg-[#DCD8CF]/60 rounded-md px-3 py-1.5 border border-[#CFCAC0]">
            <Calendar className="w-5 h-5 text-[#8B9DA8] mr-2" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent border-none text-[#5C5652] font-bold outline-none cursor-pointer" />
          </div>

          <div className="flex items-center bg-[#DCD8CF]/60 rounded-md px-3 py-1.5 border border-[#CFCAC0]">
            <User className="w-5 h-5 text-[#8B9DA8] mr-2" />
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="bg-transparent border-none text-[#5C5652] font-bold outline-none cursor-pointer appearance-none">
              <option value="七年級">七年級</option><option value="八年級">八年級</option><option value="九年級">九年級</option>
            </select>
          </div>
        </div>

        {/* 時間顯示 */}
        <div className="order-first xl:order-none w-full xl:w-auto flex justify-center my-2 xl:my-0">
          <div className="flex flex-col items-center bg-white/70 backdrop-blur-md border-2 border-[#8C9C92] rounded-2xl px-10 py-3 shadow-xl">
            <div className="flex items-center text-[#8C9C92] mb-1">
              <Clock className="w-6 h-6 mr-2" />
              <span className="font-bold tracking-widest text-base">現在時間</span>
            </div>
            <span className="font-mono text-6xl md:text-7xl font-black text-[#5C5652] tracking-[0.05em]">{formattedTime}</span>
          </div>
        </div>

        {/* 右側：工具列 */}
        <div className="flex flex-wrap items-center justify-center xl:justify-end gap-3 w-full xl:w-auto">
          {/* 儲存狀態提示 */}
          {saveStatus && <span className="text-sm font-bold text-[#6B8076] animate-pulse">{saveStatus}</span>}
          
          <button 
            onClick={handleSave} 
            className="flex items-center text-sm bg-[#6B8076] hover:bg-[#5a6b63] text-white rounded-md px-4 py-2 transition shadow-md group"
          >
            <Save className="w-4 h-4 mr-1.5 group-hover:scale-110 transition" /> 儲存目前設定
          </button>

          <div className="flex items-center bg-[#DCD8CF]/60 rounded-md px-3 py-1.5 border border-[#CFCAC0]">
            <DoorOpen className="w-4 h-4 text-[#8C9C92] mr-2" />
            <select value={doorPosition} onChange={(e) => setDoorPosition(e.target.value)} className="bg-transparent border-none text-[#5C5652] outline-none cursor-pointer appearance-none text-sm font-medium">
              <option value="left">門位: 左側</option><option value="right">門位: 右側</option>
            </select>
          </div>

          <div className="flex items-center bg-[#DCD8CF]/60 rounded-md px-3 py-1.5 border border-[#CFCAC0]">
            <LayoutGrid className="w-4 h-4 text-[#8C9C92] mr-2" />
            <select value={gridSize} onChange={(e) => setGridSize(e.target.value)} className="bg-transparent border-none text-[#5C5652] outline-none cursor-pointer appearance-none text-sm font-medium">
              <option value="6x5">排列: 6×5</option><option value="6x6">排列: 6×6</option>
            </select>
          </div>

          <div className="flex items-center bg-[#DCD8CF]/60 rounded-md px-3 py-1.5 border border-[#CFCAC0]">
            <Palette className="w-4 h-4 text-[#8C9C92] mr-2" />
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0" />
          </div>

          <button onClick={toggleFullscreen} className="flex items-center text-sm bg-[#DCD8CF]/60 hover:bg-[#D1CDC2] rounded-md px-3 py-1.5 border border-[#CFCAC0] transition">
            {isFullscreen ? <Minimize className="w-4 h-4 mr-1.5" /> : <Maximize className="w-4 h-4 mr-1.5" />}
            {isFullscreen ? '退出全螢幕' : '全螢幕'}
          </button>
          
          <button onClick={autoFillSeats} className="flex items-center text-sm bg-[#8C9C92] hover:bg-[#7A8A80] text-white rounded-md px-3 py-1.5 transition shadow-sm">
            <Edit3 className="w-4 h-4 mr-1.5" /> 快速填號
          </button>
          
          <button onClick={clearSeats} className="flex items-center text-sm bg-[#DCD8CF]/60 hover:bg-[#D1CDC2] rounded-md px-3 py-1.5 border border-[#CFCAC0] transition">
            <Eraser className="w-4 h-4 mr-1.5" /> 清空座位
          </button>
        </div>
      </div>

      {/* 主要內容區 */}
      <div className="flex flex-col gap-6 flex-1">
        
        {/* 上半部：時程與座位表 */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          {/* 左側：時程與出缺勤 */}
          <div className="w-full lg:w-[45%] flex flex-col gap-4">
            <div className="bg-[#F5F4F0]/95 rounded-xl border border-[#E0DCD3] p-6 flex flex-col shadow-lg backdrop-blur-sm h-full">
              <div className="grid grid-cols-12 gap-2 text-center text-[#8B9DA8] font-medium mb-4 pb-2 border-b border-[#E0DCD3] text-lg">
                <div className="col-span-2">節次</div>
                <div className="col-span-4">時間</div>
                <div className="col-span-3">科目</div>
                <div className="col-span-1">劃卡</div>
                <div className="col-span-2">代碼</div>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                {schedule.map((item) => {
                  const isCurrent = isCurrentTimeInPeriod(item.time, currentTime);
                  return item.isBreak ? (
                    <div key={item.id} className={`grid grid-cols-12 gap-2 items-center text-center py-2 rounded-lg transition-all duration-300 ${isCurrent ? 'bg-[#6B8076] text-white shadow-md transform scale-[1.02]' : ''}`}>
                      <div className={`col-span-2 font-bold text-lg ${isCurrent ? 'text-white' : 'text-[#8C9C92]'}`}>{item.period}</div>
                      <div className={`col-span-4 tracking-widest text-xl ${isCurrent ? 'text-white font-bold' : 'text-[#A8A39D]'}`}>{item.time}</div>
                      <div className={`col-span-3 ${isCurrent ? 'text-white font-bold' : 'text-[#A8A39D]'}`}>{item.subject}</div>
                      <div className="col-span-3"></div>
                    </div>
                  ) : (
                    <div key={item.id} className={`grid grid-cols-12 gap-2 items-center text-center p-2 rounded-lg transition-all duration-300 ${isCurrent ? 'bg-[#6B8076] text-white shadow-md transform scale-[1.02] border border-[#5C5652]/30 z-10' : 'hover:bg-[#EAE7E0]/50'}`}>
                      <div className={`col-span-2 font-bold text-xl ${isCurrent ? 'text-white' : 'text-[#8C9C92]'}`}>{item.period}</div>
                      <div className="col-span-4">
                        <input type="text" value={item.time} onChange={(e) => updateSchedule(item.id, 'time', e.target.value)} className={`bg-transparent border-none text-center text-xl font-mono w-full outline-none rounded ${isCurrent ? 'text-white font-bold' : 'text-[#5C5652]'}`} />
                      </div>
                      <div className="col-span-3">
                        <div className={`relative rounded-md ${isCurrent ? 'border-2 border-white/50 bg-[#5C5652]/20' : 'bg-[#EAE7E0]/80 border border-[#DCD8CF]'}`}>
                          <select value={item.subject} onChange={(e) => updateSchedule(item.id, 'subject', e.target.value)} className={`w-full bg-transparent border-none py-2 px-1 text-center appearance-none outline-none cursor-pointer text-lg font-medium ${isCurrent ? 'text-white font-bold' : 'text-[#6B8076]'}`}>
                            {subjects.map(sub => <option key={sub} value={sub} className="bg-white text-[#5C5652]">{sub}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button onClick={() => updateSchedule(item.id, 'isBubble', !item.isBubble)} className="focus:outline-none">
                          {item.isBubble ? <CheckCircle className={`w-6 h-6 ${isCurrent ? 'text-white' : 'text-[#B8989A]'}`} /> : <div className={`w-6 h-6 rounded-full border-2 ${isCurrent ? 'border-white/50' : 'border-[#DCD8CF]'}`} />}
                        </button>
                      </div>
                      <div className="col-span-2 px-1">
                        <input type="text" value={item.bubbleCode || ''} onChange={(e) => updateSchedule(item.id, 'bubbleCode', e.target.value.replace(/\D/g, ''))} disabled={!item.isBubble} maxLength={3} className={`w-full text-center text-lg font-bold outline-none rounded-md py-1.5 ${!item.isBubble ? 'opacity-0' : isCurrent ? 'bg-white/20 text-white' : 'bg-white/50 text-[#6B8076] border border-[#DCD8CF]'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-[#F5F4F0]/95 rounded-xl border border-[#E0DCD3] p-4 shadow-lg backdrop-blur-sm">
              <div className="grid grid-cols-4 gap-4 text-center">
                {Object.keys(attendance).filter(k => k !== 'notes').map(field => (
                  <div key={field} className="flex flex-col bg-white rounded-lg p-2 border border-[#DCD8CF]">
                    <span className="text-[#8B9DA8] text-sm mb-1">{field === 'expected' ? '應到' : field === 'present' ? '實到' : '缺考'}</span>
                    <input type="text" value={(attendance as any)[field]} onChange={(e) => setAttendance({...attendance, [field]: e.target.value})} className="bg-transparent text-center text-2xl font-bold text-[#5C5652] outline-none" />
                  </div>
                ))}
                <div className="flex flex-col bg-white rounded-lg p-2 border border-[#DCD8CF] text-left pl-3">
                  <span className="text-[#8B9DA8] text-sm mb-1">備註</span>
                  <input type="text" value={attendance.notes} onChange={(e) => setAttendance({...attendance, notes: e.target.value})} className="bg-transparent text-[#5C5652] outline-none w-full text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* 右側：座位表與提醒事項 */}
          <div className="w-full lg:w-[55%] flex flex-col gap-4">
            <div className="bg-[#F5F4F0]/95 rounded-xl border border-[#E0DCD3] p-6 flex flex-col relative shadow-lg backdrop-blur-sm transition-all duration-300">
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#EAE7E0]/80 rounded-md px-2 py-1 border border-[#DCD8CF] z-10 shadow-sm backdrop-blur-sm">
                <span className="text-xs font-bold text-[#8B9DA8]">座位高度</span>
                <button onClick={() => setSeatHeight(Math.max(40, seatHeight - 5))} className="px-2 text-[#6B8076] hover:text-[#5C5652] font-bold">-</button>
                <button onClick={() => setSeatHeight(Math.min(200, seatHeight + 5))} className="px-2 text-[#6B8076] hover:text-[#5C5652] font-bold">+</button>
              </div>

              <div className="w-2/3 mx-auto bg-[#8C9C92]/90 rounded-b-xl border-t-4 border-[#7A8A80] p-2 text-center text-white tracking-[0.5em] mb-8 font-medium mt-6">黑板 (前方)</div>
              <div className={`absolute ${doorPosition === 'left' ? 'left-4' : 'right-4'} top-24 flex flex-col items-center text-[#8B9DA8] text-sm font-bold opacity-80`}><DoorOpen className="w-6 h-6 mb-1" /><span>前門</span></div>
              <div className={`absolute ${doorPosition === 'left' ? 'left-4' : 'right-4'} bottom-10 flex flex-col items-center text-[#8B9DA8] text-sm font-bold opacity-80`}><DoorOpen className="w-6 h-6 mb-1" /><span>後門</span></div>
              <div className={`grid grid-cols-6 gap-3 ${doorPosition === 'left' ? 'ml-12 lg:ml-16 mr-4' : 'mr-12 lg:mr-16 ml-4'}`}>
                {seats.map((seat, index) => (
                  <div key={index} className="relative transition-all duration-200" style={{ height: `${seatHeight}px` }}>
                    <input type="text" value={seat} onChange={(e) => updateSeat(index, e.target.value)} className="w-full h-full bg-white border border-[#DCD8CF] shadow-sm rounded-lg text-center text-2xl font-semibold text-[#6B8076] focus:border-[#8C9C92] outline-none" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#F5F4F0]/95 rounded-xl border border-[#E0DCD3] p-4 flex flex-col flex-1 shadow-lg backdrop-blur-sm min-h-[200px]">
              <div className="flex justify-between items-center mb-3 text-[#8C9C92] font-bold">
                <div className="flex items-center"><Type className="w-5 h-5 mr-2" />提醒事項</div>
                <div className="flex items-center gap-2 bg-[#EAE7E0] rounded-md px-2 py-1 border border-[#DCD8CF]">
                  <button onClick={() => setFontSize(Math.max(16, fontSize - 2))} className="px-1">-</button>
                  <span className="text-xs">{fontSize}px</span>
                  <button onClick={() => setFontSize(Math.min(64, fontSize + 2))} className="px-1">+</button>
                </div>
              </div>
              <textarea value={reminders} onChange={(e) => setReminders(e.target.value)} className="w-full flex-1 bg-white border border-[#DCD8CF] rounded-lg p-4 text-[#5C5652] outline-none resize-none shadow-inner" style={{ fontSize: `${fontSize}px` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
