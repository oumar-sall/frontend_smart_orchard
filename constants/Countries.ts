export interface Country {
    name: string;
    code: string; // ISO code
    callingCode: string; // Dial code with 00
    flag: string; // Emoji flag
}

export const countries: Country[] = [
    { name: "Mali", code: "ML", callingCode: "00223", flag: "🇲🇱" },
    { name: "Senegal", code: "SN", callingCode: "00221", flag: "🇸🇳" },
    { name: "France", code: "FR", callingCode: "0033", flag: "🇫🇷" },
    { name: "Cote d'Ivoire", code: "CI", callingCode: "00225", flag: "🇨🇮" },
    { name: "Guinee", code: "GN", callingCode: "00224", flag: "🇬🇳" },
    { name: "Burkina Faso", code: "BF", callingCode: "00226", flag: "🇧🇫" },
    { name: "Niger", code: "NE", callingCode: "00227", flag: "🇳🇪" },
    { name: "Mauritanie", code: "MR", callingCode: "00222", flag: "🇲🇷" },
    { name: "Benin", code: "BJ", callingCode: "00229", flag: "🇧🇯" },
    { name: "Togo", code: "TG", callingCode: "00228", flag: "🇹🇬" },
    { name: "Maroc", code: "MA", callingCode: "00212", flag: "🇲🇦" },
    { name: "Algerie", code: "DZ", callingCode: "00213", flag: "🇩🇿" },
    { name: "Tunisie", code: "TN", callingCode: "00216", flag: "🇹🇳" },
    { name: "Espagne", code: "ES", callingCode: "0034", flag: "🇪🇸" },
    { name: "Italie", code: "IT", callingCode: "0039", flag: "🇮🇹" },
    { name: "Belgique", code: "BE", callingCode: "0032", flag: "🇧🇪" },
    { name: "Suisse", code: "CH", callingCode: "0041", flag: "🇨🇭" },
    { name: "Canada", code: "CA", callingCode: "001", flag: "🇨🇦" },
    { name: "USA", code: "US", callingCode: "001", flag: "🇺🇸" },
    { name: "Gabon", code: "GA", callingCode: "00241", flag: "🇬🇦" },
    { name: "Cameroun", code: "CM", callingCode: "00237", flag: "🇨🇲" },
    { name: "Congo", code: "CG", callingCode: "00242", flag: "🇨🇬" },
];

export const defaultCountry = countries[0]; // Mali
