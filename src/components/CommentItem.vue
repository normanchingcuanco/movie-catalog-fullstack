<template>
  <div class="comment">
    <p v-if="!isEditing">
      <strong>{{ comment.userId?.username || "User" }}:</strong>
      {{ comment.comment }}
      <span v-if="comment.isEdited">(edited)</span>
    </p>

    <div v-if="isEditing">
      <textarea v-model="editText" />
      <button @click="submitEdit">Save</button>
      <button @click="cancelEdit">Cancel</button>
    </div>

    <div v-if="auth.token" class="actions">
      <button @click="showReply = !showReply">Reply</button>

      <button @click="react('like')">👍 {{ comment.likes?.length || 0 }}</button>
      <button @click="react('dislike')">👎 {{ comment.dislikes?.length || 0 }}</button>

      <button v-if="canModify" @click="startEdit">Edit</button>
      <button v-if="canModify" @click="deleteComment">Delete</button>
    </div>

    <div v-if="showReply" class="reply-box">
      <textarea v-model="replyText" placeholder="Write a reply..." />
      <button @click="addReply">Submit Reply</button>
    </div>

    <div v-if="comment.replies?.length" class="replies">
      <CommentItem
        v-for="reply in comment.replies"
        :key="reply._id"
        :comment="reply"
        :movieId="movieId"
        @refresh="$emit('refresh')"
      />
    </div>
  </div>
</template>

<script>
import api from "../api"
import { useAuthStore } from "../auth"

export default {
  name: "CommentItem",
  props: ["comment", "movieId"],

  data() {
    return {
      showReply: false,
      replyText: "",
      isEditing: false,
      editText: ""
    }
  },

  setup() {
    const auth = useAuthStore()
    return { auth }
  },

  computed: {
    canModify() {
      const isAdmin = this.auth.isAdmin === true
      const isOwner =
        String(this.comment.userId?._id || this.comment.userId) === String(this.auth.userId)

      return isAdmin || isOwner
    }
  },

  methods: {
    async addReply() {
      if (!this.replyText.trim()) return

      await api.patch(
        `/movies/replyComment/${this.movieId}/${this.comment._id}`,
        { comment: this.replyText },
        { headers: { Authorization: `Bearer ${this.auth.token}` } }
      )

      this.replyText = ""
      this.showReply = false
      this.$emit("refresh")
    },

    startEdit() {
      this.isEditing = true
      this.editText = this.comment.comment
    },

    cancelEdit() {
      this.isEditing = false
      this.editText = ""
    },

    async submitEdit() {
      if (!this.editText.trim()) return

      await api.patch(
        `/movies/editComment/${this.movieId}/${this.comment._id}`,
        { comment: this.editText },
        { headers: { Authorization: `Bearer ${this.auth.token}` } }
      )

      this.isEditing = false
      this.$emit("refresh")
    },

    async deleteComment() {
      await api.delete(
        `/movies/deleteComment/${this.movieId}/${this.comment._id}`,
        { headers: { Authorization: `Bearer ${this.auth.token}` } }
      )

      this.$emit("refresh")
    },

    async react(type) {
      await api.patch(
        `/movies/reactComment/${this.movieId}/${this.comment._id}`,
        { type },
        { headers: { Authorization: `Bearer ${this.auth.token}` } }
      )

      this.$emit("refresh")
    }
  }
}
</script>

<style>
.comment {
  margin: 10px 0;
  padding: 10px;
  background: #f2f2f2;
  border-radius: 6px;
}
.actions button {
  margin-right: 10px;
}
.reply-box {
  margin-top: 8px;
}
.replies {
  margin-left: 20px;
  margin-top: 8px;
}
textarea {
  width: 100%;
  min-height: 60px;
}
</style>