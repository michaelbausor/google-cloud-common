# Cross-Language Tests for Google Firestore Clients

This directory contains tests that can be run against any Firestore client
following the standard client specification.

- `proto`: the protobuffers defining the test format.

- `testdata`: the tests.
   - `*.textproto`: a single test in text proto format.
   - `tests.binprotos`: all the tests in a single file. The protos are in binary
      format, each preceded by its length encoded as a varint.

- `cmd/generate-firestore-tests/generate-firestore-tests.go`: the Go program that generates the tests.

- `Makefile`: Fulfill the prerequisites at the top of the file, then run `make`
   to regenerate the tests.
