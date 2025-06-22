'use client';

import { useState } from 'react';
import { Evidence } from '../../types/game';
import { useGameStore } from '../../stores/gameStore';
import { getAllEvidence } from '../../data/evidence';

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  evidence: Evidence | null;
  character?: string;
  type: 'discovery' | 'event' | 'analysis';
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export default function EvidenceTimeline() {
  const store = useGameStore();
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'discovery' | 'event' | 'analysis'>('all');

  // Generate timeline events based on discovered evidence and game state
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const allEvidence = getAllEvidence();
    
    // Add pre-defined story events
    events.push(
      {
        id: 'marlene_death',
        time: '22:00',
        title: 'Bà Marlene qua đời',
        description: 'Bà Marlene được phát hiện đã qua đời trong phòng ngủ của mình.',
        evidence: null,
        type: 'event',
        importance: 'critical'
      },
      {
        id: 'family_gathering',
        time: '20:30',
        title: 'Gia đình tụ họp',
        description: 'Tất cả thành viên gia đình có mặt trong bữa tối.',
        evidence: null,
        type: 'event',
        importance: 'medium'
      }
    );

    // Add evidence discoveries
    store.evidenceFound.forEach(evidenceId => {
      const evidence = allEvidence.find(e => e.id === evidenceId);
      if (evidence) {
        let discoveryTime = '23:00'; // Default discovery time
        let importance: 'low' | 'medium' | 'high' | 'critical' = 'medium';
        
        // Assign specific times and importance based on evidence
        switch (evidence.id) {
          case 'wine_glass':
            discoveryTime = '22:15';
            importance = 'critical';
            break;
          case 'threatening_letter':
            discoveryTime = '22:45';
            importance = 'high';
            break;
          case 'spare_key':
            discoveryTime = '23:10';
            importance = 'high';
            break;
          case 'broken_necklace':
            discoveryTime = '22:30';
            importance = 'medium';
            break;
          default:
            discoveryTime = '23:00';
            importance = 'medium';
        }

        events.push({
          id: `discovery_${evidence.id}`,
          time: discoveryTime,
          title: `Phát hiện: ${evidence.name}`,
          description: evidence.description,
          evidence,
          character: evidence.relatedCharacter,
          type: 'discovery',
          importance
        });
      }
    });

    // Add conversation events
    store.conversationHistory.forEach((conv, index) => {
      events.push({
        id: `conversation_${index}`,
        time: `23:${20 + index * 5}`,
        title: `Trò chuyện với ${conv.characterId}`,
        description: `Cuộc hội thoại tiết lộ thông tin về ${conv.characterId}.`,
        evidence: null,
        character: conv.characterId,
        type: 'event',
        importance: 'medium'
      });
    });

    // Sort by time
    return events.sort((a, b) => {
      const timeA = parseInt(a.time.replace(':', ''));
      const timeB = parseInt(b.time.replace(':', ''));
      return timeA - timeB;
    });
  };

  const [timelineEvents] = useState(() => generateTimelineEvents());
  
  const filteredEvents = timelineEvents.filter(event => 
    filterType === 'all' || event.type === filterType
  );

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'discovery': return '🔍';
      case 'analysis': return '🔬';
      case 'event': return '📅';
      default: return '📝';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'medium': return 'border-blue-500 bg-blue-500/10';
      case 'low': return 'border-gray-500 bg-gray-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-amber-400 mb-4">⏱️ Timeline Điều Tra</h2>
      
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        {(['all', 'discovery', 'event', 'analysis'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              filterType === type 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {type === 'all' ? 'Tất cả' :
             type === 'discovery' ? 'Phát hiện' :
             type === 'event' ? 'Sự kiện' : 'Phân tích'}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-600"></div>
        
        <div className="space-y-4">
                     {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`relative flex items-start gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                getImportanceColor(event.importance)
              } ${selectedEvent?.id === event.id ? 'scale-105 shadow-lg' : 'hover:scale-102'}`}
              onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
            >
              {/* Timeline Dot */}
              <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                event.importance === 'critical' ? 'bg-red-500' :
                event.importance === 'high' ? 'bg-orange-500' :
                event.importance === 'medium' ? 'bg-blue-500' : 'bg-gray-500'
              }`}>
                {getEventIcon(event)}
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-white text-sm">{event.title}</h3>
                  <span className="text-xs text-gray-400 font-mono">{event.time}</span>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed">
                  {event.description}
                </p>

                {/* Character Badge */}
                {event.character && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-purple-600 text-white text-xs rounded">
                      {event.character}
                    </span>
                  </div>
                )}

                {/* Evidence Details (when expanded) */}
                {selectedEvent?.id === event.id && event.evidence && (
                  <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold text-blue-400 mb-2">Chi tiết bằng chứng:</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div><strong>Tên:</strong> {event.evidence.name}</div>
                      <div><strong>Mô tả:</strong> {event.evidence.description}</div>
                      {event.evidence.relatedCharacter && (
                        <div><strong>Liên quan:</strong> {event.evidence.relatedCharacter}</div>
                      )}
                      <div><strong>Loại:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          event.evidence.isRedHerring ? 'bg-red-600' : 'bg-green-600'
                        }`}>
                          {event.evidence.isRedHerring ? 'Bằng chứng giả' : 'Bằng chứng thật'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Importance Indicator */}
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full ${
                  event.importance === 'critical' ? 'bg-red-500 animate-pulse' :
                  event.importance === 'high' ? 'bg-orange-500' :
                  event.importance === 'medium' ? 'bg-blue-500' : 'bg-gray-500'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Summary */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-400">
              {filteredEvents.filter(e => e.type === 'discovery').length}
            </div>
            <div className="text-xs text-gray-500">Phát Hiện</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">
              {filteredEvents.filter(e => e.type === 'event').length}
            </div>
            <div className="text-xs text-gray-500">Sự Kiện</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-400">
              {filteredEvents.filter(e => e.importance === 'critical').length}
            </div>
            <div className="text-xs text-gray-500">Quan Trọng</div>
          </div>
        </div>
      </div>
    </div>
  );
} 