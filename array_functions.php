<?php
// examples
// $arr = [1, 2, 3, 4, 5 ... 100];
$arr = [];
for ($i = 0; $i < 100; $i++) {
    $arr[] = $i;
}

$arr = array_map(function ($i) {
    return $i;
}, range(1, 100));

$count = count(array_filter($arr, function($i) {
    return $i > 50 && $i < 70;
}));

for ($i = 0; $i < 100; $i++) {
    if ($i > 50 && $i < 70) {
        $count++;
    }
}

$firstItems = 3;
$sum = 0;
array_walk($arr, function ($value) use (&$sum) {
    return $sum += $value;
});

for ($i = 0; $i < $firstItems; $i++) {
    $sum += $arr[$i];
}

var_dump($sum, array_sum($arr));

/*foreach ($arr as $key => $value) {
    if ($key < $firstItems) {
        $sum += $value;
    }
}*/

$firstElements = array_slice($arr, 0, $firstItems);
// var_dump(array_sum($firstElements));

$multiplied = 1;
foreach ($arr as $key => $value) {
    $multiplied *= $value;
}

var_dump($multiplied, array_product($arr));
