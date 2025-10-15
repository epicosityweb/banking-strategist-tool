/**
 * HubSpot Event Types
 *
 * Defines standard HubSpot events and custom event patterns for activity-based
 * qualification rules in the Banking Journey Orchestration Framework.
 *
 * Based on HubSpot's Event Analytics API and Timeline Events documentation:
 * - https://developers.hubspot.com/docs/api-reference/event-analytics/guide
 * - https://developers.hubspot.com/docs/api-reference/automation-automation-v4-v4/guide
 */

export interface HubSpotEvent {
  id: string;
  name: string;
  category: 'email' | 'form' | 'page' | 'cta' | 'marketing' | 'custom';
  eventTypeId?: string; // For standard HubSpot events
  description: string;
}

/**
 * Standard HubSpot Events
 * These are native events tracked by HubSpot across email, forms, pages, and CTAs
 */
export const HUBSPOT_STANDARD_EVENTS: HubSpotEvent[] = [
  // Email Events
  {
    id: 'email_open',
    name: 'Email Open',
    category: 'email',
    eventTypeId: '4-666440',
    description: 'Contact opened a marketing email',
  },
  {
    id: 'email_click',
    name: 'Email Click',
    category: 'email',
    eventTypeId: '4-666441',
    description: 'Contact clicked a link in a marketing email',
  },
  {
    id: 'email_bounce',
    name: 'Email Bounce',
    category: 'email',
    eventTypeId: '4-666288',
    description: 'Email bounced (hard or soft)',
  },
  {
    id: 'email_delivered',
    name: 'Email Delivered',
    category: 'email',
    description: 'Email was successfully delivered to the contact',
  },
  {
    id: 'email_spam_report',
    name: 'Email Marked as Spam',
    category: 'email',
    description: 'Contact marked the email as spam',
  },
  {
    id: 'email_unsubscribe',
    name: 'Email Unsubscribe',
    category: 'email',
    description: 'Contact unsubscribed from email communications',
  },

  // Form Events
  {
    id: 'form_submission',
    name: 'Form Submission',
    category: 'form',
    eventTypeId: '4-1639801',
    description: 'Contact submitted a HubSpot form',
  },
  {
    id: 'form_view',
    name: 'Form View',
    category: 'form',
    description: 'Contact viewed a form on a page',
  },

  // Page Events
  {
    id: 'page_view',
    name: 'Page View',
    category: 'page',
    eventTypeId: '4-1553668',
    description: 'Contact viewed a page on your website',
  },
  {
    id: 'landing_page_view',
    name: 'Landing Page View',
    category: 'page',
    description: 'Contact viewed a HubSpot landing page',
  },

  // CTA Events
  {
    id: 'cta_view',
    name: 'CTA View',
    category: 'cta',
    eventTypeId: '4-1555804',
    description: 'Contact viewed a call-to-action (CTA)',
  },
  {
    id: 'cta_click',
    name: 'CTA Click',
    category: 'cta',
    eventTypeId: '4-1555805',
    description: 'Contact clicked a call-to-action (CTA)',
  },

  // Marketing Events
  {
    id: 'ad_interaction',
    name: 'Ad Interaction',
    category: 'marketing',
    eventTypeId: '4-1553675',
    description: 'Contact interacted with a HubSpot ad',
  },
  {
    id: 'marketing_event_registration',
    name: 'Marketing Event Registration',
    category: 'marketing',
    eventTypeId: '4-68559',
    description: 'Contact registered for a marketing event',
  },
  {
    id: 'marketing_event_attendance',
    name: 'Marketing Event Attendance',
    category: 'marketing',
    description: 'Contact attended a marketing event',
  },
];

/**
 * Event Categories for Grouping
 */
export const EVENT_CATEGORIES: Record<string, string> = {
  email: 'Email',
  form: 'Forms',
  page: 'Page Views',
  cta: 'CTAs',
  marketing: 'Marketing',
  custom: 'Custom Events',
};

/**
 * Get events grouped by category
 */
export function getEventsByCategory(): Record<string, HubSpotEvent[]> {
  const grouped: Record<string, HubSpotEvent[]> = {
    email: [],
    form: [],
    page: [],
    cta: [],
    marketing: [],
    custom: [],
  };

  HUBSPOT_STANDARD_EVENTS.forEach((event) => {
    grouped[event.category].push(event);
  });

  return grouped;
}

/**
 * Find event by ID
 */
export function findEventById(id: string): HubSpotEvent | undefined {
  return HUBSPOT_STANDARD_EVENTS.find((event) => event.id === id);
}

/**
 * Validate custom event format
 * Custom events follow the pattern: pe{portalId}_{event_name}
 * Example: pe1234567_account_login
 */
export function validateCustomEventFormat(eventName: string): boolean {
  const customEventRegex = /^pe\d+_[a-z0-9_]+$/;
  return customEventRegex.test(eventName);
}

/**
 * Get event display name
 */
export function getEventDisplayName(eventId: string): string {
  const event = findEventById(eventId);
  if (event) {
    return event.name;
  }

  // Check if it's a custom event
  if (validateCustomEventFormat(eventId)) {
    // Extract event name from format: pe1234567_event_name -> Event Name
    const parts = eventId.split('_');
    const eventName = parts.slice(1).join(' ');
    return eventName
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return eventId;
}
