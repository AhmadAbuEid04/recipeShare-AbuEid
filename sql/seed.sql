-- Sample data (M7): six recipes, each with a different cuisine, covering several categories.
-- Run once after schema.sql and policies.sql. Photos: Unsplash (free license), food only.

insert into public.recipes (author_name, title, cuisine, category, ingredients, steps, prep_minutes, image_url) values
('Sara', 'Saffron Chicken Rice', 'Iranian', 'Main Dish',
 E'2 cups basmati rice\n4 chicken thighs\n1 onion\n1/2 tsp saffron\n2 tbsp butter\nSalt',
 E'Soak saffron in warm water.\nBrown the onion and chicken.\nAdd rice, saffron water and 3 cups water.\nCook covered on low heat for 25 minutes.',
 50, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=70'),
('Marco', 'Margherita Pizza', 'Italian', 'Fast Food',
 E'1 pizza dough\n1/2 cup tomato sauce\n200 g mozzarella\nFresh basil\nOlive oil',
 E'Heat the oven to 250 °C.\nStretch the dough and spread the sauce.\nAdd mozzarella and bake 10 minutes.\nTop with basil and olive oil.',
 30, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=70'),
('Yuki', 'Shoyu Ramen', 'Japanese', 'Soup',
 E'2 portions ramen noodles\n4 cups chicken broth\n3 tbsp soy sauce\n2 eggs\nGreen onions',
 E'Soft-boil the eggs for 6.5 minutes.\nSimmer broth with soy sauce.\nCook noodles and add to bowls.\nPour broth over and top with eggs and onions.',
 25, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=70'),
('Priya', 'Chickpea Curry with Rice', 'Indian', 'Main Dish',
 E'2 cans chickpeas\n1 onion\n2 tomatoes\n1 cup coconut milk\n2 tsp curry powder\nCooked rice',
 E'Fry the onion with curry powder.\nAdd tomatoes and cook 5 minutes.\nAdd chickpeas and coconut milk; simmer 15 minutes.\nServe with rice.',
 35, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=70'),
('Anna', 'Raspberry Cream Cake', 'German', 'Dessert',
 E'1 sponge cake base\n300 g raspberries\n400 ml whipping cream\n3 tbsp sugar',
 E'Whip the cream with sugar.\nSlice the sponge in half.\nLayer cream and raspberries.\nChill for 1 hour.',
 40, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=70'),
('Jake', 'Salmon Power Salad', 'American', 'Salad',
 E'1 salmon fillet\n2 cups lettuce\n1 cup corn\n1 cup cherry tomatoes\n1/4 red cabbage\nLemon dressing',
 E'Pan-sear the salmon 4 minutes per side.\nChop the vegetables.\nCombine in a bowl and add dressing.',
 20, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=70');

-- A few starting ratings so averages are visible.
insert into public.ratings (recipe_id, stars)
select id, s from public.recipes, unnest(array[5, 4]) as s where title = 'Saffron Chicken Rice'
union all
select id, 5 from public.recipes where title = 'Margherita Pizza'
union all
select id, s from public.recipes, unnest(array[4, 4, 3]) as s where title = 'Chickpea Curry with Rice';
