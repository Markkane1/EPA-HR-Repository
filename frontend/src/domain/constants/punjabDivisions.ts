export const PUNJAB_DIVISIONS: Record<string, string[]> = {
  'Lahore': ['Lahore', 'Kasur', 'Sheikhupura', 'Nankana Sahib'],
  'Gujranwala': ['Gujranwala', 'Sialkot', 'Narowal', 'Hafizabad'],
  'Gujrat': ['Gujrat', 'Mandi Bahauddin', 'Wazirabad'],
  'Rawalpindi': ['Rawalpindi', 'Attock', 'Chakwal', 'Jhelum', 'Murree'],
  'Sargodha': ['Sargodha', 'Khushab', 'Mianwali', 'Bhakkar'],
  'Faisalabad': ['Faisalabad', 'Jhang', 'Toba Tek Singh', 'Chiniot'],
  'Multan': ['Multan', 'Lodhran', 'Khanewal', 'Vehari'],
  'Sahiwal': ['Sahiwal', 'Pakpattan', 'Okara'],
  'Bahawalpur': ['Bahawalpur', 'Bahawalnagar', 'Rahim Yar Khan'],
  'Dera Ghazi Khan': ['Dera Ghazi Khan', 'Rajanpur', 'Muzaffargarh', 'Layyah', 'Taunsa', 'Kot Addu'],
};

export const getDivisionForDistrict = (districtName?: string | null): string => {
  if (!districtName) return 'Other';
  
  const normalizedDist = districtName.trim().toLowerCase();
  
  for (const [division, districts] of Object.entries(PUNJAB_DIVISIONS)) {
    if (districts.some(d => d.toLowerCase() === normalizedDist)) {
      return division;
    }
  }
  
  return 'Other'; // Fallback for unknown districts or Head Office
};

export const ALL_DIVISIONS = Object.keys(PUNJAB_DIVISIONS);

export const groupOfficesByDivision = (offices: any[] | undefined | null) => {
  if (!offices || !Array.isArray(offices)) return [];
  
  const groups: Record<string, { value: string; label: string }[]> = {};
  
  ALL_DIVISIONS.concat(['Other']).forEach(div => {
    groups[div] = [];
  });
  
  offices.forEach(office => {
    const div = getDivisionForDistrict(office.district);
    if (!groups[div]) groups[div] = [];
    groups[div].push({ value: office.id, label: office.name });
  });
  
  return Object.entries(groups)
    .filter(([_, opts]) => opts.length > 0)
    .map(([label, options]) => ({ label: `${label} Division`, options }));
};
