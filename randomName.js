

function rnd(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
  }

  Names = [
  'Nilima',
  'Grant',
  'Joanne',
  'Milton',
  'Jerald',
  'Barry',
  'Darrin',
  'Jorge',
  'Noah',
  'Agnes',
  'Doreen',
  'Ed',
  'Veronica',
  'Myra',
  'Ronnie',
  'Trevor',
  'Carroll',
  'Lora',
  'Mark',
  'Colin',
  'Candace',
  'Irma',
  'Kelly',
  'Emilio',
  'Erma',
  'Julian',
  'Kurt',
  'Ivan',
  'Philip',
  'Colleen',
  'Lynn',
  'Alice',
  'Mattie',
  'Rodney',
  'Megan',
  'Clifford',
  'Pauline',
  'Tiffany',
  'Fernando',
  'Santos',
  'Margie',
  'Michael',
  'Preston',
  'Evan',
  'Darrel',
  'Dixie',
  'Jeffrey',
  'Andres',
  'Clifton',
  'Lucas',
  'Dwayne',
  'Bridget',
  'Enrique',
  'Kristine',
  'Marguerite',
  'Christopher',
  'Jenny',
  'Clayton',
  'Sarah'
  ];

  // console.log(rndName());

  function rndName(){
  	return Names[rnd(0, Names.length-1)];
  }


  module.exports = rndName;