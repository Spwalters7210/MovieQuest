import { ATTRIBUTES, MOVIES } from './movie-data.js';

export function newProfile() {
  return { mystery: 1, suspense: 1, humor: 1, action: 1 };
}

export function applyChoice(profile, effects) {
  for (const attr of ATTRIBUTES) {
    const change = effects[attr] || 0;
    profile[attr] = Math.max(0, Math.min(5, profile[attr] + change));
  }
  return profile;
}

export function scoreMovie(profile, movie) {
  // Smaller distance means a closer match. All four attributes have equal weight.
  const distance = ATTRIBUTES.reduce((sum, attr) => sum + Math.abs(profile[attr] - movie.traits[attr]), 0);
  return 100 - (distance / (ATTRIBUTES.length * 5)) * 100;
}

export function recommend(profile, catalog = MOVIES) {
  return catalog.map(movie => ({ ...movie, score: scoreMovie(profile, movie) }))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

export function explain(profile, movie) {
  const ranked = [...ATTRIBUTES].sort((a,b) => Math.abs(profile[a]-movie.traits[a]) - Math.abs(profile[b]-movie.traits[b]));
  return `Strongest matching traits: ${ranked.slice(0,2).join(' and ')}.`;
}
