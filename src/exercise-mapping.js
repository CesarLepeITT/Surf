// Search candidates intentionally remain independent from external IDs/paths.
// The importer verifies these against the JSON that actually exists in the dataset.
export const exerciseMappings = {
  'push-ups': ['push-up', 'push ups'],
  'air-squats': ['air squat', 'bodyweight squat', 'squat'],
  'plank-shoulder-taps': ['plank shoulder tap', 'shoulder tap'],
  lunges: ['lunge', 'bodyweight lunge'],
  supermans: ['superman'],
  'cat-cow': ['cat cow', 'cat-cow'],
  'childs-pose': ["child's pose", 'child pose'],
  'lizard-pose': ['lizard pose'],
  'hip-flexor-lunge-stretch': ['hip flexor lunge stretch', 'hip flexor stretch'],
  '90-90-stretch': ['90/90 stretch', '90 90 stretch'],
  'sumo-squat-stretch': ['sumo squat stretch'],
  'deep-squat-stretch': ['deep squat stretch', 'seated squat stretch'],
  'toe-touch': ['toe touch'],
  'pigeon-pose': ['pigeon pose'],
  'seated-forward-fold': ['seated forward fold']
};
