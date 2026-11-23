// In-memory sample data used only when Supabase is not configured (local demo mode).
// The same recipes are loaded into the real database by sql/seed.sql.
const img = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=70`;

export const SAMPLE_RECIPES = [
  {
    id: 1, author_name: 'Sara', title: 'Saffron Chicken Rice', cuisine: 'Iranian', category: 'Main Dish',
    ingredients: '2 cups basmati rice\n4 chicken thighs\n1 onion\n1/2 tsp saffron\n2 tbsp butter\nSalt',
    steps: 'Soak saffron in warm water.\nBrown the onion and chicken.\nAdd rice, saffron water and 3 cups water.\nCook covered on low heat for 25 minutes.',
    prep_minutes: 50, image_url: img('1512058564366-18510be2db19'), created_at: '2026-11-01T10:00:00Z',
    ratings: [5, 4],
  },
  {
    id: 2, author_name: 'Marco', title: 'Margherita Pizza', cuisine: 'Italian', category: 'Fast Food',
    ingredients: '1 pizza dough\n1/2 cup tomato sauce\n200 g mozzarella\nFresh basil\nOlive oil',
    steps: 'Heat the oven to 250 °C.\nStretch the dough and spread the sauce.\nAdd mozzarella and bake 10 minutes.\nTop with basil and olive oil.',
    prep_minutes: 30, image_url: img('1565299624946-b28f40a0ae38'), created_at: '2026-11-02T10:00:00Z',
    ratings: [5],
  },
  {
    id: 3, author_name: 'Yuki', title: 'Shoyu Ramen', cuisine: 'Japanese', category: 'Soup',
    ingredients: '2 portions ramen noodles\n4 cups chicken broth\n3 tbsp soy sauce\n2 eggs\nGreen onions',
    steps: 'Soft-boil the eggs for 6.5 minutes.\nSimmer broth with soy sauce.\nCook noodles and add to bowls.\nPour broth over and top with eggs and onions.',
    prep_minutes: 25, image_url: img('1569718212165-3a8278d5f624'), created_at: '2026-11-03T10:00:00Z',
    ratings: [],
  },
  {
    id: 4, author_name: 'Priya', title: 'Chickpea Curry with Rice', cuisine: 'Indian', category: 'Main Dish',
    ingredients: '2 cans chickpeas\n1 onion\n2 tomatoes\n1 cup coconut milk\n2 tsp curry powder\nCooked rice',
    steps: 'Fry the onion with curry powder.\nAdd tomatoes and cook 5 minutes.\nAdd chickpeas and coconut milk; simmer 15 minutes.\nServe with rice.',
    prep_minutes: 35, image_url: img('1585937421612-70a008356fbe'), created_at: '2026-11-04T10:00:00Z',
    ratings: [4, 4, 3],
  },
  {
    id: 5, author_name: 'Anna', title: 'Raspberry Cream Cake', cuisine: 'German', category: 'Dessert',
    ingredients: '1 sponge cake base\n300 g raspberries\n400 ml whipping cream\n3 tbsp sugar',
    steps: 'Whip the cream with sugar.\nSlice the sponge in half.\nLayer cream and raspberries.\nChill for 1 hour.',
    prep_minutes: 40, image_url: img('1565958011703-44f9829ba187'), created_at: '2026-11-05T10:00:00Z',
    ratings: [5, 5],
  },
  {
    id: 6, author_name: 'Jake', title: 'Salmon Power Salad', cuisine: 'American', category: 'Salad',
    ingredients: '1 salmon fillet\n2 cups lettuce\n1 cup corn\n1 cup cherry tomatoes\n1/4 red cabbage\nLemon dressing',
    steps: 'Pan-sear the salmon 4 minutes per side.\nChop the vegetables.\nCombine in a bowl and add dressing.',
    prep_minutes: 20, image_url: img('1546069901-ba9599a7e63c'), created_at: '2026-11-06T10:00:00Z',
    ratings: [],
  },
];
