/** RTC resource types — keep in sync with dashboard.models.RTCResource.ResourceType */
export const RESOURCE_TYPE_LABELS = {
    TOR: 'Mandate / Terms of Reference',
    MOU: 'Founding Memorandum',
    STRATEGY: 'Strategic Plan',
    PLAN: 'Annual Training Plan',
    CATALOGUE: 'Training Catalogue',
    REPORT: 'Annual Report / Newsletter',
    PUB: 'Publication / Handbook',
    ELEARN: 'E-Learning Link',
    PRESENTATION: 'RTC Presentation',
};

export const RESOURCE_TYPE_CHOICES = Object.entries(RESOURCE_TYPE_LABELS).map(
    ([value, label]) => ({ value, label })
);

export const getResourceTypeLabel = (type, t) => {
    if (!type) return '';
    const key = `resource_type_${type}`;
    if (t) {
        const translated = t(key, { defaultValue: RESOURCE_TYPE_LABELS[type] || type });
        if (translated !== key) return translated;
    }
    return RESOURCE_TYPE_LABELS[type] || type;
};
