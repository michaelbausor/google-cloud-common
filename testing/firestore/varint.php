<?php

class VarInt
{
    public static function encode($number) {
        $buf = '';
        while (true) {
            $toWrite = $number & 0x7f;
            $number = $number >> 7;
            if ($number) {
                $buf .= pack('c', $toWrite | 0x80);
            } else {
                $buf .= pack('c', $toWrite);
                break;
            }
        }
        return $buf;
    }

    public static function decode($bytes, $index) {
        $shift = 0;
        $result = 0;
        while (true) {
            $i = unpack('C', substr($bytes, $index, 1))[1];
            $index += 1;
		    $result = $result | (($i & 0x7f) << $shift);
		    $shift += 7;
		    if (!($i & 0x80)) {
		        break;
            }
        }
        return [$result, $index];
    }
}

