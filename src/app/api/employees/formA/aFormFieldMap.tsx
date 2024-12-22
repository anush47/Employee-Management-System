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
  sex: {
    group: "Option Button 1_2",
    options: {
      female: "1",
      male: "2",
    },
  },
  married: {
    group: "Option Button 1",
    options: {
      single: "1",
      married: "2",
    },
  },
  spouseName: ["Text Box 11", "Text Box 1", "Text Box 8", "Text Box 10"].concat(
    Array.from({ length: 17 }, (_, i) => `Text Box ${i + 12}`)
  ),
  motherName: Array.from({ length: 21 }, (_, i) => `Text Box 6_${i + 83}`),
  fatherName: Array.from({ length: 21 }, (_, i) => `Text Box 6_${i + 105}`),
  mobileNumber: [`Text Box 6_127`].concat(
    Array.from({ length: 9 }, (_, i) => `Text Box 6_${i + 136}`)
  ),
  email: ["Text Box 9"],
  employerNameAndAddress: ["Text Box 30"],
  date: ["Date Field 1_3"],
  employerNo_H: {
    number: Array.from({ length: 6 }, (_, i) => `Text Box 6_${i + 146}`).concat(
      [`Text Box 6_160`]
    ),
    zone: ["Text Box 6_152"],
  },
  memberNo_H: Array.from({ length: 7 }, (_, i) => `Text Box 6_${i + 153}`),
  employeeName_H: ["Text Box 4"],
  employerName_H: ["Text Box 4_2"],
  date_H: ["Date Field 1"],
  employerName_H_2: ["Text Box 4_3"],
  employeeName_H_2: ["Text Box 4_4"],
  date_H_2: ["Date Field 1_2"],
  witnessName_H: ["Text Box 4_5"],
  witnessDescriptionAddress: ["Text Box 5"],
};
