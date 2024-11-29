export const aFormMap = {
  nic: Array.from(
    { length: 12 },
    (_, i) => `Text Box 6${i === 0 ? "" : `_${i + 1}`}`
  ),
  employerNo: {
    number: Array.from({ length: 7 }, (_, i) => `Text Box 6_${i + 13}`),
    zone: ["Text Box 6_20"],
  },
  memberNo: Array.from({ length: 7 }, (_, i) => `Text Box 6_${i + 21}`),
  startDate: {
    day: Array.from({ length: 2 }, (_, i) => `Text Box 6_${i + 128}`),
    month: Array.from({ length: 2 }, (_, i) => `Text Box 6_${i + 130}`),
    year: Array.from({ length: 4 }, (_, i) => `Text Box 6_${i + 132}`),
  },
  designation: ["Text Box 6_28"],
  fullName: ["Text Box 7_2"],
  nameWithInitials: Array.from(
    { length: 72 - 29 + 1 },
    (_, i) => `Text Box 6_${i + 29}`
  ),
  address: ["Text Box 31"],
  birthday: {
    day: Array.from({ length: 2 }, (_, i) => `Text Box 6_${i + 73}`),
    month: Array.from({ length: 2 }, (_, i) => `Text Box 6_${i + 75}`),
    year: Array.from({ length: 4 }, (_, i) => `Text Box 6_${i + 77}`),
  },
  age: Array.from({ length: 2 }, (_, i) => `Text Box 6_${i + 81}`),
  birthPlace: ["Text Box 6_145"],
  nationality: ["Text Box 2"],
};
