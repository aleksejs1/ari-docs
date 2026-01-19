import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api/ari-crm",
    },
    {
      type: "category",
      label: "Autocomplete",
      items: [
        {
          type: "doc",
          id: "api/get-autocomplete",
          label: "Get autocomplete suggestions for contact forms",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "ContactGraph",
      items: [
        {
          type: "doc",
          id: "api/get-contact-graph",
          label: "Retrieves a ContactGraph resource.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "ContactTimeline",
      items: [
        {
          type: "doc",
          id: "api/get-contact-timeline",
          label: "Retrieves a ContactTimeline resource.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "DemoAccount",
      items: [
        {
          type: "doc",
          id: "api/generate-demo-account",
          label: "Generate a demo account",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Auth",
      items: [
        {
          type: "doc",
          id: "api/api-logout-post",
          label: "Log out (revoke refresh token)",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Stats",
      items: [
        {
          type: "doc",
          id: "api/get-stats",
          label: "Retrieves a Stats resource.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "EventType",
      items: [
        {
          type: "doc",
          id: "api/event-types",
          label: "Retrieves the collection of EventType resources.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "ActivityFeed",
      items: [
        {
          type: "doc",
          id: "api/api-activity-feed-get-collection",
          label: "Retrieves the collection of ActivityFeed resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/mark-as-read",
          label: "Updates the ActivityFeed resource.",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/get-unread-count",
          label: "Retrieves the collection of ActivityFeed resources.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "AuditLog",
      items: [
        {
          type: "doc",
          id: "api/api-audit-logs-get-collection",
          label: "Retrieves the collection of AuditLog resources.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Contact",
      items: [
        {
          type: "doc",
          id: "api/api-contacts-get-collection",
          label: "Retrieves the collection of Contact resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contacts-post",
          label: "Creates a Contact resource.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/contact-export",
          label: "Retrieves the collection of Contact resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/import-contact-xml",
          label: "Import contacts from XML",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/api-contacts-id-get",
          label: "Retrieves a Contact resource.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contacts-id-put",
          label: "Replaces the Contact resource.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/api-contacts-id-delete",
          label: "Removes the Contact resource.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/api-contacts-id-patch",
          label: "Updates the Contact resource.",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/contact-similar",
          label: "Retrieves a Contact resource.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/contact-vcard",
          label: "Retrieves a Contact resource.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "ContactAddress",
      items: [
        {
          type: "doc",
          id: "api/api-contact-addresses-get-collection",
          label: "Retrieves the collection of ContactAddress resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-addresses-post",
          label: "Creates a ContactAddress resource.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/api-contact-addresses-id-get",
          label: "Retrieves a ContactAddress resource.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-addresses-id-put",
          label: "Replaces the ContactAddress resource.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/api-contact-addresses-id-delete",
          label: "Removes the ContactAddress resource.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/api-contact-addresses-id-patch",
          label: "Updates the ContactAddress resource.",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "ContactAvatar",
      items: [
        {
          type: "doc",
          id: "api/api-contacts-idavatar-post",
          label: "Upload a contact avatar",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "ContactBiography",
      items: [
        {
          type: "doc",
          id: "api/api-contact-biographies-get-collection",
          label: "Retrieves the collection of ContactBiography resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-biographies-post",
          label: "Creates a ContactBiography resource.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/api-contact-biographies-id-get",
          label: "Retrieves a ContactBiography resource.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-biographies-id-put",
          label: "Replaces the ContactBiography resource.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/api-contact-biographies-id-delete",
          label: "Removes the ContactBiography resource.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/api-contact-biographies-id-patch",
          label: "Updates the ContactBiography resource.",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "ContactDate",
      items: [
        {
          type: "doc",
          id: "api/api-contact-dates-get-collection",
          label: "Retrieves the collection of ContactDate resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-dates-post",
          label: "Creates a ContactDate resource.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/api-contact-dates-id-get",
          label: "Retrieves a ContactDate resource.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-dates-id-put",
          label: "Replaces the ContactDate resource.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/api-contact-dates-id-delete",
          label: "Removes the ContactDate resource.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/api-contact-dates-id-patch",
          label: "Updates the ContactDate resource.",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "ContactEmailAdress",
      items: [
        {
          type: "doc",
          id: "api/api-contact-email-adresses-get-collection",
          label: "Retrieves the collection of ContactEmailAdress resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-email-adresses-post",
          label: "Creates a ContactEmailAdress resource.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/api-contact-email-adresses-id-get",
          label: "Retrieves a ContactEmailAdress resource.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-email-adresses-id-put",
          label: "Replaces the ContactEmailAdress resource.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/api-contact-email-adresses-id-delete",
          label: "Removes the ContactEmailAdress resource.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/api-contact-email-adresses-id-patch",
          label: "Updates the ContactEmailAdress resource.",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "ContactGroup",
      items: [
        {
          type: "doc",
          id: "api/api-contact-groups-get-collection",
          label: "Retrieves the collection of ContactGroup resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-groups-post",
          label: "Creates a ContactGroup resource.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/api-contact-groups-id-get",
          label: "Retrieves a ContactGroup resource.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-groups-id-put",
          label: "Replaces the ContactGroup resource.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/api-contact-groups-id-delete",
          label: "Removes the ContactGroup resource.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/api-contact-groups-id-patch",
          label: "Updates the ContactGroup resource.",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "ContactName",
      items: [
        {
          type: "doc",
          id: "api/api-contact-names-get-collection",
          label: "Retrieves the collection of ContactName resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-names-post",
          label: "Creates a ContactName resource.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/api-contact-names-id-get",
          label: "Retrieves a ContactName resource.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-names-id-put",
          label: "Replaces the ContactName resource.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/api-contact-names-id-delete",
          label: "Removes the ContactName resource.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/api-contact-names-id-patch",
          label: "Updates the ContactName resource.",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "ContactOrganization",
      items: [
        {
          type: "doc",
          id: "api/api-contact-organizations-get-collection",
          label: "Retrieves the collection of ContactOrganization resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-organizations-post",
          label: "Creates a ContactOrganization resource.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/api-contact-organizations-id-get",
          label: "Retrieves a ContactOrganization resource.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-organizations-id-put",
          label: "Replaces the ContactOrganization resource.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/api-contact-organizations-id-delete",
          label: "Removes the ContactOrganization resource.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/api-contact-organizations-id-patch",
          label: "Updates the ContactOrganization resource.",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "ContactPhoneNumber",
      items: [
        {
          type: "doc",
          id: "api/api-contact-phone-numbers-get-collection",
          label: "Retrieves the collection of ContactPhoneNumber resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-phone-numbers-post",
          label: "Creates a ContactPhoneNumber resource.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/api-contact-phone-numbers-id-get",
          label: "Retrieves a ContactPhoneNumber resource.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-phone-numbers-id-put",
          label: "Replaces the ContactPhoneNumber resource.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/api-contact-phone-numbers-id-delete",
          label: "Removes the ContactPhoneNumber resource.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/api-contact-phone-numbers-id-patch",
          label: "Updates the ContactPhoneNumber resource.",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "ContactRelation",
      items: [
        {
          type: "doc",
          id: "api/api-contact-relations-get-collection",
          label: "Retrieves the collection of ContactRelation resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-relations-post",
          label: "Creates a ContactRelation resource.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/api-contact-relations-id-get",
          label: "Retrieves a ContactRelation resource.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-contact-relations-id-put",
          label: "Replaces the ContactRelation resource.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/api-contact-relations-id-delete",
          label: "Removes the ContactRelation resource.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/api-contact-relations-id-patch",
          label: "Updates the ContactRelation resource.",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "Group",
      items: [
        {
          type: "doc",
          id: "api/api-groups-get-collection",
          label: "Retrieves the collection of Group resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-groups-post",
          label: "Creates a Group resource.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/api-groups-id-get",
          label: "Retrieves a Group resource.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-groups-id-put",
          label: "Replaces the Group resource.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/api-groups-id-delete",
          label: "Removes the Group resource.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/api-groups-id-patch",
          label: "Updates the Group resource.",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "NotificationChannel",
      items: [
        {
          type: "doc",
          id: "api/api-notification-channels-get-collection",
          label: "Retrieves the collection of NotificationChannel resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-notification-channels-post",
          label: "Creates a NotificationChannel resource.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/api-notification-channels-id-get",
          label: "Retrieves a NotificationChannel resource.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-notification-channels-id-put",
          label: "Replaces the NotificationChannel resource.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/api-notification-channels-id-delete",
          label: "Removes the NotificationChannel resource.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/api-notification-channels-id-patch",
          label: "Updates the NotificationChannel resource.",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/verify-channel",
          label: "Send verification email for this channel",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "NotificationIntent",
      items: [
        {
          type: "doc",
          id: "api/api-notification-intents-get-collection",
          label: "Retrieves the collection of NotificationIntent resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-notification-intents-id-get",
          label: "Retrieves a NotificationIntent resource.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "NotificationPolicy",
      items: [
        {
          type: "doc",
          id: "api/api-notification-policies-get-collection",
          label: "Retrieves the collection of NotificationPolicy resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-notification-policies-post",
          label: "Creates a NotificationPolicy resource.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/api-notification-policies-id-get",
          label: "Retrieves a NotificationPolicy resource.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-notification-policies-id-put",
          label: "Replaces the NotificationPolicy resource.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/api-notification-policies-id-delete",
          label: "Removes the NotificationPolicy resource.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/api-notification-policies-id-patch",
          label: "Updates the NotificationPolicy resource.",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "NotificationSubscription",
      items: [
        {
          type: "doc",
          id: "api/api-notification-subscriptions-get-collection",
          label: "Retrieves the collection of NotificationSubscription resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-notification-subscriptions-post",
          label: "Creates a NotificationSubscription resource.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/api-notification-subscriptions-id-get",
          label: "Retrieves a NotificationSubscription resource.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-notification-subscriptions-id-put",
          label: "Replaces the NotificationSubscription resource.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/api-notification-subscriptions-id-delete",
          label: "Removes the NotificationSubscription resource.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/api-notification-subscriptions-id-patch",
          label: "Updates the NotificationSubscription resource.",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "ActiveSession",
      items: [
        {
          type: "doc",
          id: "api/api-active-sessions-get-collection",
          label: "Retrieves the collection of ActiveSession resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-active-sessions-id-delete",
          label: "Removes the ActiveSession resource.",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "User",
      items: [
        {
          type: "doc",
          id: "api/api-profile-delete",
          label: "Removes the User resource.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/change-password",
          label: "Replaces the User resource.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/api-users-post",
          label: "Creates a User resource.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/api-users-id-get",
          label: "Retrieves a User resource.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "UserPref",
      items: [
        {
          type: "doc",
          id: "api/api-user-prefs-get-collection",
          label: "Retrieves the collection of UserPref resources.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-user-prefs-type-get",
          label: "Retrieves a UserPref resource.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/api-user-prefs-type-put",
          label: "Replaces the UserPref resource.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/api-user-prefs-type-delete",
          label: "Removes the UserPref resource.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/api-user-prefs-type-patch",
          label: "Updates the UserPref resource.",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "Google",
      items: [
        {
          type: "doc",
          id: "api/connect-google-check",
          label: "Handle Google OAuth Callback.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/import-google-contacts",
          label: "Import contacts from Google People API.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/connect-google-start",
          label: "Get Google OAuth Authorization URL.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Login Check",
      items: [
        {
          type: "doc",
          id: "api/login-check-post",
          label: "Creates a user token.",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
