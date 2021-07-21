<template>
  <v-dialog
  v-model="dialog"
          max-width="500px"
		  persistent
        >
          <v-card>
            <v-card-title>
              <span class="text-h5">formTitle</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.Date"
                      label="Date"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.Text"
                      label="Text"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.User"
                      label="User"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.Hours"
                      label="Hours"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue darken-1"
                text
                @click="close"
              >
                Cancel
              </v-btn>
              <v-btn
                color="blue darken-1"
                text
                @click="save"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
</template>

<script>
export default {
	name:"EditDialog",
	props: [
		"dialog",
	],
	data() {
		return {
			// dialog:false,
			editedItem: {
				Date:'',
				Text:'',
				User:'',
				Hours: 0
			},
			defaultItem: {
				Date:'',
				Text:'',
				User:'',
				Hours: 0
			},
		}
	},
	methods: {
		close () {
		this.$emit("updateDialogStatus", false);
      },
	  save () {
        this.dialog = false
      },
	}
}
</script>

<style>

</style>