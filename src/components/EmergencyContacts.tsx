import React from 'react';
import { Phone, Mail, AlertTriangle, User, Shield } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  priority: number;
}

interface EmergencyContactsProps {
  contacts: Contact[];
  onEscalate: (contactId: string) => void;
}

export function EmergencyContacts({ contacts, onEscalate }: EmergencyContactsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">Emergency Contacts</h2>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          Manage Contacts
        </button>
      </div>

      <div className="space-y-4">
        {contacts.sort((a, b) => a.priority - b.priority).map((contact) => (
          <div key={contact.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-500">{contact.relationship}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Priority {contact.priority}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600"
              >
                <Phone className="w-4 h-4" />
                <span>{contact.phone}</span>
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600"
              >
                <Mail className="w-4 h-4" />
                <span>{contact.email}</span>
              </a>
            </div>

            <button
              onClick={() => onEscalate(contact.id)}
              className="mt-4 w-full py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
            >
              Escalate Emergency
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}