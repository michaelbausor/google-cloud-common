<?php

require __DIR__ . '/vendor/autoload.php';

use Tests\Test;

function loadProto($bytes, $index) {
    list($num, $index) = VarInt::decode($bytes, $index);
    $binProto = substr($bytes, $index, $num);
    $testProto = new Test();
    $testProto->mergeFromString($binProto);
    return [$testProto, $index + $num];
}

function loadAllProtos($bytes) {
    $index = 0;
    $len = strlen($bytes);
    $protos = [];
    while ($index < $len) {
        list($proto, $index) = loadProto($bytes, $index);
        $protos[] = $proto;
    }
    return $protos;
}

$binProtos = file_get_contents(__DIR__ . "/testdata/tests.binprotos");
$protos = loadAllProtos($binProtos);
echo "proto size: " . count($protos) . "\n";
