import React from 'react';
import { Bell, Mail, Phone, MessageSquare, Clock, Settings } from 'lucide-react';

interface NotificationChannel {
  id: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp';
  enabled: boolean;
  schedule: {
    start: string;
    end: string;
  };
  categories: string[];
}

interface NotificationPreferencesProps {
  channels: NotificationChannel[];
  onUpdateChannel: (channelId: string, updates: Partial<NotificationChannel>) => void;
}

export function NotificationPreferences({ channels, onUpdateChannel }: NotificationPreferencesProps) {
  const getChannelIcon = (type: NotificationChannel['type']) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5 text-blue-500" />;
      case 'sms':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'push':
        return <Bell className="w-5 h-5 text-purple-500" />;
      case 'whatsapp':
        return <Phone className="w-5 h-5 text-orange-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
        </div>
      </div>

      <div className="space-y-6">
        {channels.map((channel) => (
          <div key={channel.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getChannelIcon(channel.type)}
                <span className="font-medium text-gray-900 capitalize">
                  {channel.type} Notifications
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={channel.enabled}
                  onChange={(e) => onUpdateChannel(channel.id, { enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Clock className="w-4 h-4 text-gray-500" />
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={channel.schedule.start}
                    onChange={(e) => onUpdateChannel(channel.id, {
                      schedule: { ...channel.schedule, start: e.target.value }
                    })}
                    className="px-2 py-1 border rounded"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={channel.schedule.end}
                    onChange={(e) => onUpdateChannel(channel.id, {
                      schedule: { ...channel.schedule, end: e.target.value }
                    })}
                    className="px-2 py-1 border rounded"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {channel.categories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}