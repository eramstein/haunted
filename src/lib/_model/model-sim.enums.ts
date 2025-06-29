export enum ItemType {
  FoodIngredient = 'FoodIngredient',
  Meal = 'Meal',
  Drink = 'Drink',
}

export enum ActivityType {
  GoTo = 'goTo',
  Eat = 'eat',
  Cook = 'cook',
  Sleep = 'sleep',
  Play = 'play',
  Chat = 'chat',
  Buy = 'buy',
  Work = 'work',
  AskForHelp = 'askForHelp',
  GroupMeal = 'groupMeal',
  PrepareMeal = 'prepareMeal',
}

export enum ActivityTag {
  AtRestaurant = 'atRestaurant',
  Delivery = 'delivery',
  HomeCooking = 'homeCooking',
  IsDate = 'isDate',
}

export enum ObjectiveType {
  HaveMeal = 'haveMeal',
  Rest = 'rest',
  HaveFun = 'haveFun',
  Socialize = 'socialize',
  GetMoney = 'getMoney',
  SolveProblem = 'solveProblem',
}

export enum RelationshipStatus {
  Unknown = 'does not know',
  Acquaintance = 'acquaintance of',
  Friend = 'friend of',
  CloseFriend = 'close friend of',
  RomanticPartner = 'in couple with',
  Spouse = 'spouse of',
  Sibling = 'sibling of',
}

export enum RelationshipFeeling {
  Admiration = 'admiration',
  Affection = 'affection',
  Attraction = 'attraction',
  Love = 'love',
  Gratitude = 'gratitude',
  Trust = 'trust',
  Jealousy = 'jealousy',
  Envy = 'envy',
  Resentment = 'resentment',
  Annoyance = 'annoyance',
  Intimidation = 'intimidation',
  Rivalry = 'rivalry',
  Respect = 'respect',
  Suspicion = 'suspicion',
  Protectiveness = 'protectiveness',
}

export enum EmotionType {
  Joy = 'joyful',
  Sadness = 'sad',
  Anger = 'angry',
  Fear = 'fearful',
  Surprise = 'surprised',
  Anticipation = 'anticipating',
  Disgust = 'disgusted',
  Trust = 'trusting',
}

export enum ProblemType {
  NoProblem = 'just tilting for no cause',
  NoFood = 'has no food',
  NoMoney = 'has no money',
}

export enum ProblemReason {
  NoReason = 'life is unfair',
  NoIncome = 'has no income',
}
