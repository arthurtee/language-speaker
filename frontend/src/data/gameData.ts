export const countries = [
    { id: 'singapore', name: 'Singapore', language: 'en-SG', label: 'English' },
    { id: 'malaysia', name: 'Malaysia', language: 'ms-MY', label: 'Malay' },
    { id: 'japan', name: 'Japan', language: 'ja-JP', label: 'Japanese' },
    { id: 'korea', name: 'Korea', language: 'ko-KR', label: 'Korean' },
    { id: 'china', name: 'China', language: 'zh-CN', label: 'Chinese' },
];

export const professions = [
    {
        id: 'doctor',
        name: 'Doctor',
        image: '/images/doctor.png', // Placeholder
        translations: {
            singapore: ['doctor', 'physician'],
            malaysia: ['doktor'],
            japan: ['isha', 'sensei'], // sensei is also used but isha is specific
            korea: ['uisa', 'uisa-nim'],
            china: ['yisheng'],
        },
    },
    {
        id: 'police',
        name: 'Police',
        image: '/images/police.png', // Placeholder
        translations: {
            singapore: ['police', 'policeman', 'policewoman'],
            malaysia: ['polis'],
            japan: ['keisatsu', 'omawarisan'],
            korea: ['gyeongchal', 'gyeongchal-gwan'],
            china: ['jingcha'],
        },
    },
    {
        id: 'criminal',
        name: 'Criminal',
        image: '/images/criminal.png', // Placeholder
        translations: {
            singapore: ['criminal', 'robber', 'thief'],
            malaysia: ['penjenayah'],
            japan: ['hannin', 'hanni'],
            korea: ['beom-in', 'beomin'],
            china: ['zuifan'],
        },
    },
    {
        id: 'chef',
        name: 'Chef',
        image: '/images/chef.png', // Placeholder
        translations: {
            singapore: ['chef', 'cook'],
            malaysia: ['tukang masak', 'chef'],
            japan: ['shefu', 'itamae'],
            korea: ['yorisa', 'shepeu'],
            china: ['chushi'],
        },
    },
];
