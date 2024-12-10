const standardsSchema = new mongoose.Schema({
  gender: { type: String, enum: ['BOYS', 'GIRLS'] },
  course: { type: String, enum: ['SCY', 'LCM', 'SCM'] },
  ageGroup: String,
  event: String,
  standards: {
    AAAA: Number,
    AAA: Number,
    AA: Number,
    A: Number,
    BB: Number,
    B: Number
  },
  updatedAt: { type: Date, default: Date.now }
}); 