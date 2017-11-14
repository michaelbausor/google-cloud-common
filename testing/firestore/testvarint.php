<?php

require __DIR__ . '/varint.php';

$testData = [
    [0, hex2bin('00')],
    [1, hex2bin('01')],
    [128, hex2bin('8001')],
    [255, hex2bin('ff01')],
    [256, hex2bin('8002')],
    [(1 << 13), hex2bin('8040')],
    [(1 << 14), hex2bin('808001')],
];

foreach ($testData as $test) {
    list($num, $bin) = $test;
    echo "InitNum: $num\n";
    list($convNum, $index) = VarInt::decode($bin, 0);
    echo "ConvNum: $convNum\n";
    echo "InitBin: " . bin2hex($bin) . "\n";
    echo "ConvBin: " . bin2hex(VarInt::encode($num)) . "\n";
}
